package com.alicorp.zeusBack.SQL.security.service;

import com.alicorp.zeusBack.SQL.security.entity.PasswordHistorico;
import com.alicorp.zeusBack.SQL.security.entity.TokenVigencia;
import com.alicorp.zeusBack.SQL.security.entity.Usuario;
import com.alicorp.zeusBack.SQL.security.repository.DominioCorreoRepository;
import com.alicorp.zeusBack.SQL.security.repository.PasswordHistoricoRepository;
import com.alicorp.zeusBack.SQL.security.repository.TokenVigenciaRepository;
import com.alicorp.zeusBack.SQL.security.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.jni.Local;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.chrono.ChronoLocalDateTime;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class TokenVigenciaService {
    private final TokenVigenciaRepository tokenVigenciaRepository;
    private final PasswordHistoricoRepository passwordHistoricoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final DominioCorreoRepository dominioCorreoRepository;

    public Boolean save(TokenVigencia tokenVigencia){
        List<TokenVigencia> listToken = tokenVigenciaRepository.findAll().stream().filter(e -> Objects.equals(e.getUsuario_id(), tokenVigencia.getUsuario_id()) && e.getStatus()).collect(Collectors.toList());
        for (TokenVigencia objToken: listToken) {
            objToken.setStatus(false);
            tokenVigenciaRepository.save(objToken);
        }

        ZoneId zoneId = ZoneId.of("America/Lima");
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        System.out.println("Fecha y hora actual V1: " + now);
        LocalDateTime fechaHoraAtual = now.toLocalDateTime();

        tokenVigencia.setFecha_creacion(fechaHoraAtual);
        tokenVigencia.setFecha_expiracion(fechaHoraAtual.plusHours(24));

        tokenVigenciaRepository.save(tokenVigencia);
        tokenVigenciaRepository.enviarCorreo(400, tokenVigencia.getUsuario_id(), tokenVigencia.getToken());
        return true;
    }

    public Boolean getTokenValidation(String token, String username){
        ZoneId zoneId = ZoneId.of("America/Lima");
        ZonedDateTime fechaActual = ZonedDateTime.now(zoneId);
        TokenVigencia objToken = tokenVigenciaRepository.findAll().stream().filter(e -> Objects.equals(e.getToken(), token) && e.getStatus()).collect(Collectors.toList()).get(0);

        if(objToken != null && objToken.getFecha_expiracion().compareTo(ChronoLocalDateTime.from(fechaActual)) >= 0){
            Usuario objUsuario = usuarioRepository.findAll().stream().filter(e -> Objects.equals(e.getId(), objToken.getUsuario_id())).collect(Collectors.toList()).get(0);
            return Objects.equals(objUsuario.getNombreUsuario(), username);
        }
        else{
            return false;
        }
    }

    public void desactivarToken(Integer idUsuario, String password){
        List<TokenVigencia> listToken = tokenVigenciaRepository.findAll().stream().filter(e -> Objects.equals(e.getUsuario_id(), idUsuario) && e.getStatus()).collect(Collectors.toList());
        for (TokenVigencia objToken: listToken) {
            objToken.setStatus(false);
            tokenVigenciaRepository.save(objToken);
        }
        tokenVigenciaRepository.enviarCorreo(401, idUsuario, password);
    }

    /*
    public boolean PasswordExists(Usuario usuarioModificado) {
        Usuario objUsuario = usuarioRepository.findById(usuarioModificado.getId()).orElse(null);
        if (objUsuario != null) {
            String contrasenaEncriptada = objUsuario.getPassword();
            return passwordEncoder.matches(usuarioModificado.getPassword(), contrasenaEncriptada);
        }
        return false;
    }

     */

    public boolean passwordExists(Usuario usuarioModificado) {
        List<PasswordHistorico> listPasswordHistorico = passwordHistoricoRepository
                .findAll(Sort.by(Sort.Direction.DESC, "fechaCreacion"))
                .stream()
                .filter(e -> Objects.equals(e.getUsuarioId(), usuarioModificado.getId()))
                .limit(3)
                .collect(Collectors.toList());

        for (PasswordHistorico objPassword : listPasswordHistorico) {
            String contrasenaEncriptada = objPassword.getPassword();
            if(passwordEncoder.matches(usuarioModificado.getPassword(), contrasenaEncriptada)){
                return true;
            }
        }
        return false;
    }

    public void savePasswordHistorico(Usuario usuarioModificado, boolean esNuevoUsuario){
        //Deshabilitar antiguas contraseñas del histórico
        List<PasswordHistorico> listPasswordsUsuario = passwordHistoricoRepository.findAll().stream().filter(e -> Objects.equals(e.getUsuarioId(), usuarioModificado.getId())).collect(Collectors.toList());
        for (PasswordHistorico objPassword: listPasswordsUsuario) {
            objPassword.setStatus(false);
            passwordHistoricoRepository.save(objPassword);
        }

        //Registrar nueva contraseña en el histórico
        ZoneId zoneId = ZoneId.of("America/Lima");
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        System.out.println("Fecha y hora actual V1: " + now);
        LocalDateTime fechaHoraAtual = now.toLocalDateTime();

        PasswordHistorico objPasswordHistorico = new PasswordHistorico();
        objPasswordHistorico.setUsuarioId(usuarioModificado.getId());
        objPasswordHistorico.setPassword(usuarioModificado.getPassword());
        objPasswordHistorico.setFechaCreacion(fechaHoraAtual);
        objPasswordHistorico.setFechaExpiracion(esNuevoUsuario ? fechaHoraAtual : fechaHoraAtual.plusDays(90));
        objPasswordHistorico.setStatus(true);
        passwordHistoricoRepository.save(objPasswordHistorico);
    }

    public boolean validarVigenciaPassword(Usuario objUsuario){
        LocalDateTime fechaVencimientoPassword = passwordHistoricoRepository
                .findAll(Sort.by(Sort.Direction.DESC, "id"))
                .stream()
                .filter(e -> Objects.equals(e.getUsuarioId(), objUsuario.getId()) && e.getStatus())
                .collect(Collectors.toList())
                .get(0).getFechaExpiracion();
        ZoneId zoneId = ZoneId.of("America/Lima");
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        LocalDateTime fechaHoraAtual = now.toLocalDateTime();
        return (fechaVencimientoPassword.compareTo(fechaHoraAtual) >= 0);
    }

    public boolean esUsuarioNuevo(Usuario objUsuario){
        LocalDateTime fechaVencimientoPassword = passwordHistoricoRepository
                .findAll(Sort.by(Sort.Direction.DESC, "id"))
                .stream()
                .filter(e -> Objects.equals(e.getUsuarioId(), objUsuario.getId()) && e.getStatus())
                .collect(Collectors.toList())
                .get(0).getFechaExpiracion();
        LocalDateTime fechaInicioPassword = passwordHistoricoRepository
                .findAll(Sort.by(Sort.Direction.DESC, "id"))
                .stream()
                .filter(e -> Objects.equals(e.getUsuarioId(), objUsuario.getId()) && e.getStatus())
                .collect(Collectors.toList())
                .get(0).getFechaCreacion();
        return (fechaVencimientoPassword.compareTo(fechaInicioPassword) == 0);
    }

    public List<String> getDominiosCorreos(){
        return dominioCorreoRepository.findAll().stream().filter(e -> e.getStatus() == 1).map(e -> e.getDominio()).collect(Collectors.toList());
    }
}
