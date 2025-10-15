package com.alicorp.zeusBack.SQL.security.service;

import com.alicorp.zeusBack.SQL.security.entity.UsuarioSustento;
import com.alicorp.zeusBack.SQL.security.repository.UsuarioSustentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class UsuarioSustentoService {
    @Autowired
    UsuarioSustentoRepository usuarioSustentoRepository;
    public void guardarSustentos(Set<UsuarioSustento> usuarioSustentos){
        usuarioSustentoRepository.saveAll(usuarioSustentos);
    }
}
