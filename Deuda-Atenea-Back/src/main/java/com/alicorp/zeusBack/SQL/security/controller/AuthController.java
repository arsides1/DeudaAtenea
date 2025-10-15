package com.alicorp.zeusBack.SQL.security.controller;

import com.alicorp.zeusBack.SQL.security.dto.JwtDTO;
import com.alicorp.zeusBack.SQL.security.dto.LoginUsuario;
import com.alicorp.zeusBack.SQL.security.dto.NuevoUsuario;
import com.alicorp.zeusBack.SQL.security.entity.*;
import com.alicorp.zeusBack.SQL.security.jwt.JwtProvider;
import com.alicorp.zeusBack.SQL.security.service.RolService;
import com.alicorp.zeusBack.SQL.security.service.TokenVigenciaService;
import com.alicorp.zeusBack.SQL.security.service.UsuarioService;
import com.alicorp.zeusBack.SQL.security.service.UsuarioSustentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UsuarioService usuarioService;

    @Autowired
    RolService rolService;

    @Autowired
    UsuarioSustentoService usuarioSustentoService;

    @Autowired
    JwtProvider jwtProvider;

    @Autowired
    TokenVigenciaService tokenVigenciaService;

    @PostMapping("/nuevo")
    public ResponseEntity<?> nuevo(@RequestBody NuevoUsuario nuevoUsuario, BindingResult bindingResult){
        if(bindingResult.hasErrors())
            return new ResponseEntity("Campos mal puestos o email inválido", HttpStatus.BAD_REQUEST);

        if(usuarioService.existsByNombreUsuario(nuevoUsuario.getNombreUsuario()))
            return new ResponseEntity("El usuario ya existe", HttpStatus.BAD_REQUEST);

        if(usuarioService.existsByEmail(nuevoUsuario.getEmail()))
            return new ResponseEntity("Email ya existe", HttpStatus.BAD_REQUEST);

        Integer nuevoID = usuarioService.getUltimoID() + 1;

        ZoneId zoneId = ZoneId.of("America/Lima");
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        System.out.println("Fecha y hora actual V1: " + now);
        LocalDateTime fechaHoraAtual = now.toLocalDateTime();

        nuevoUsuario.setFechaRegistro(fechaHoraAtual);

        Usuario usuario = new Usuario(nuevoID,nuevoUsuario.getNombre(),nuevoUsuario.getNombreUsuario(),nuevoUsuario.getEmail(),
                                    passwordEncoder.encode(nuevoUsuario.getPassword()), true, nuevoUsuario.getRegistradoPor(), nuevoUsuario.getFechaRegistro());

        Set<Rol> roles = new HashSet<>();
        nuevoUsuario.getRoles().forEach(rolNombre -> roles.add(rolService.getRolByName(rolNombre)));
        usuario.setRoles(roles);

        Set<UsuarioSustento> sustentos = new HashSet<>();

        for(String sustento: nuevoUsuario.getSustentos()){
            UsuarioSustento objUsuarioSustento = new UsuarioSustento();
            objUsuarioSustento.setUsuario_id(usuario.getId());
            objUsuarioSustento.setArchivo(sustento);
            sustentos.add(objUsuarioSustento);
        }

        usuarioService.save(usuario);
        usuarioSustentoService.guardarSustentos(sustentos);
        tokenVigenciaService.savePasswordHistorico(usuario, true);

        usuarioService.enviarCorreoRegistro(usuario.getId(), nuevoUsuario.getPassword(), usuario.getRegistradoPor());

        return  new ResponseEntity("usuario guardado", HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtDTO> login(@RequestBody LoginUsuario loginUsuario, BindingResult bindingResult){
        Collection<? extends GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("Administrador")
        );

        JwtDTO jwtDto = new JwtDTO("abcdefghijk", "usuarioPrueba", authorities,"Usuario de Prueba", 9999);
        return new ResponseEntity(jwtDto, HttpStatus.OK);
    }

    @GetMapping("/getUserByUsername")
    public ResponseEntity<Usuario> getUserByUsername(String username)throws Exception{
        if(!usuarioService.existsByNombreUsuario(username) || !usuarioService.getByNombreUsuario(username).get().getEstado())
            return new ResponseEntity("El usuario no existe", HttpStatus.BAD_REQUEST);
        Usuario userDetails = usuarioService.getByNombreUsuario(username).get();
        return new ResponseEntity<>(userDetails, HttpStatus.OK);
    }

    @GetMapping("/getUserByEmail")
    public ResponseEntity<Usuario> getUserByEmail(String email)throws Exception{
        if(!usuarioService.existsByEmail(email) || !usuarioService.getByEmail(email).get().getEstado())
            return new ResponseEntity("No existe un usuario registrado con este correo", HttpStatus.BAD_REQUEST);
        Usuario userDetails = usuarioService.getByEmail(email).get();
        return new ResponseEntity<>(userDetails, HttpStatus.OK);
    }

    @PostMapping("/nuevoToken")
    public Boolean nuevoToken(@RequestBody TokenVigencia tokenVigencia){
        Boolean flgCorreoEnviado = false;
        flgCorreoEnviado = tokenVigenciaService.save(tokenVigencia);
        return  flgCorreoEnviado;
    }

    @GetMapping("/getTokenValidation")
    public Boolean getTokenValidation(String token, String username)throws Exception{
         return tokenVigenciaService.getTokenValidation(token, username);
    }

    @PostMapping("/updatePassword")
    public Boolean updatePassword(@RequestBody Usuario usuarioModificado){
        if (!tokenVigenciaService.passwordExists(usuarioModificado)){
            String password = usuarioModificado.getPassword();
            String encodedPassword = passwordEncoder.encode(usuarioModificado.getPassword());
            usuarioModificado.setPassword(encodedPassword);
            usuarioService.save(usuarioModificado);
            tokenVigenciaService.savePasswordHistorico(usuarioModificado, false);
            tokenVigenciaService.desactivarToken(usuarioModificado.getId(), password);
            return true;
        }
        else{
            return false;
        }
    }

    @GetMapping("/getDominiosCorreos")
    public List<String> getDominiosCorreos()throws Exception{
        return tokenVigenciaService.getDominiosCorreos();
    }

    @GetMapping("/getRolesByUsuarioGestor")
    public List<Rol> getRolesByUsuarioGestor(String nombreUsuario)throws Exception{
        return rolService.getRolesByUsuarioGestor(nombreUsuario);
    }

    @GetMapping("/getRolesPorUsuarios")
    public List<RolPorUsuario> getRolesPorUsuarios()throws Exception{
        return rolService.getRolesPorUsuarios();
    }
}
