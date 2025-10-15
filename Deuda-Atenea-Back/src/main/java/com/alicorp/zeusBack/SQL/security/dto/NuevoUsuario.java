package com.alicorp.zeusBack.SQL.security.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class NuevoUsuario {
    private  Integer id;
    private  String nombre;
    private  String nombreUsuario;
    private  String email;
    private  String password;
    private Integer registradoPor;
    private LocalDateTime fechaRegistro;
    private Set<String> roles = new HashSet<>();
    private Set<String> sustentos = new HashSet<>();
}
