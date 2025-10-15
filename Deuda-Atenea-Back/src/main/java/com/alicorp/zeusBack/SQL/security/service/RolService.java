package com.alicorp.zeusBack.SQL.security.service;

import com.alicorp.zeusBack.SQL.security.entity.RolPorUsuario;
import com.alicorp.zeusBack.SQL.security.repository.RolPorUsuarioRepository;
import com.alicorp.zeusBack.SQL.security.repository.RolRepository;
import com.alicorp.zeusBack.SQL.security.entity.Rol;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RolService {

    @Autowired
    RolRepository rolRepository;

    @Autowired
    RolPorUsuarioRepository rolPorUsuarioRepository;

    public void save(Rol rol){
        rolRepository.save(rol);
    }

    public List<Rol> getRolesByUsuarioGestor(String nombreUsuario){
        return rolRepository.getRolesByUsuarioGestor(nombreUsuario);
    }

    public Rol getRolByName(String rolNombre){
        return  rolRepository.findByRolNombre(rolNombre);
    }

    public List<RolPorUsuario> getRolesPorUsuarios(){
        return rolPorUsuarioRepository.getRolesByUsuarios();
    }
}
