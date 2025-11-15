package com.alicorp.zeusBack.Postgres.model.Tesoreria;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name="t064_currency", schema="public")
public class Moneda {
    @Column(name = "t064_id")
    @Id
    private String t064Id;
    @Column(name = "t064_description")
    private String t064Description;
    @Column(name = "t064_status")
    private Boolean t064Status;

}
