package com.alicorp.zeusBack.SQL.security.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

@Getter
@Setter
public class JwtDTO {

    private String token;
    private String bearer = "Bearer";
    private String nombreUsuario;
    private Collection<? extends GrantedAuthority> authorities;
    private String nombre;
    private Integer id;

    public JwtDTO(String token, String nombreUsuario, Collection<? extends GrantedAuthority> authorities,String nombre, Integer id) {
        this.token = token;
        this.nombreUsuario = nombreUsuario;
        this.authorities = authorities;
        this.nombre = nombre;
        this.id = id;
    }
}
