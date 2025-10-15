package com.alicorp.zeusBack.SQL.security.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name="rol", schema="dbo")
public class Rol {
    @Column
    @Id
    private Integer id;
    @Column
    private String rolNombre;
    @Column
    private Integer estado;
    @Column
    private String descripcion;
}
