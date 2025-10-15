package com.alicorp.zeusBack.SQL.security.service;

import com.alicorp.zeusBack.SQL.security.entity.Rol;
import com.alicorp.zeusBack.SQL.security.entity.T010_User;
import com.alicorp.zeusBack.SQL.security.repository.T010_UserRepository;
import com.alicorp.zeusBack.SQL.security.repository.UsuarioRepository;
import com.alicorp.zeusBack.SQL.security.entity.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UsuarioService {

    @Autowired
    UsuarioRepository usuarioRepository;
    @Autowired
    T010_UserRepository t010UserRepository;

    public Optional<Usuario> getByNombreUsuario(String nombreUsuario){
        return usuarioRepository.findByNombreUsuario(nombreUsuario);
    }

    public Optional<Usuario> getByEmail(String email){
        return usuarioRepository.findByEmail(email);
    }

    public boolean existsByNombreUsuario(String nombreUsuario){
        return usuarioRepository.existsByNombreUsuario(nombreUsuario);
    }

    public boolean existsByEmail(String email){
        return usuarioRepository.existsByEmail(email);
    }

    public void save(Usuario usuario){
        usuarioRepository.save(usuario);

        T010_User objT010_User = new T010_User();
        objT010_User.setT010_ID(usuario.getNombreUsuario());
        objT010_User.setT010_Profile(1);
        objT010_User.setT010_Name(usuario.getNombre());
        objT010_User.setT010_Status(1);
        objT010_User.setT010_Email(usuario.getEmail());
        t010UserRepository.save(objT010_User);
    }

    public void enviarCorreoRegistro(Integer idUsuarioNuevo, String password, Integer idUsuarioRegistrador){
        usuarioRepository.enviarCorreoRegistroCredenciales(404, idUsuarioNuevo, password);
        usuarioRepository.enviarCorreoRegistroNotifiacion(405, idUsuarioNuevo, idUsuarioRegistrador);
    }

    public Integer getUltimoID(){
        return usuarioRepository.getUltimoID();
    }

}
