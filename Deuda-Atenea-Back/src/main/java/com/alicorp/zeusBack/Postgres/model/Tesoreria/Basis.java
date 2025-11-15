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
@Table(name="t448_basis", schema="public")
public class Basis {
    @Column(name = "t448_id")
    @Id
    private Integer t448_id;
    @Column(name = "t448_description")
    private String t448_description;
    @Column(name = "t448_code_bbg")
    private String t448_code_bbg;
    @Column(name = "t448_status")
    private Boolean t448_status;
}
