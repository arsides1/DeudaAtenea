package com.alicorp.zeusBack.SQL.security.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class RolPorUsuario {
    @Column
    @Id
    private Integer id;
    @Column
    private Integer idUsuario;
    @Column
    private String nombre;
    @Column
    private Integer idRol;
    @Column
    private String descripcionRol;
}
