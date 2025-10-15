package com.alicorp.zeusBack.Postgres.model.Tesoreria;

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
