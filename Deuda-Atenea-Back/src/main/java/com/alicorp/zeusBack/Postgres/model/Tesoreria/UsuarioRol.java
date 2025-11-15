package com.alicorp.zeusBack.Postgres.model.Tesoreria;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Entity
public class UsuarioRol {
    @Column
    @Id
    private Integer id_usuario_rol;
    @Column
    private String rol;
    @Column
    private String usuario;
    @Column
    private String email;
}
