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
public class OpcionesCombo {
    @Column
    @Id
    private Integer id_combo;
    @Column
    private String descripcion_combo;
}
