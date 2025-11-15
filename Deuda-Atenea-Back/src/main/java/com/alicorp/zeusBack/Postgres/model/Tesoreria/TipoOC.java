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
@Table(name="t445_type_co", schema="public")
public class TipoOC {
    @Column(name = "t445_id")
    @Id
    private String t445_id;
    @Column(name = "t445_description")
    private String t445_description;
    @Column(name = "t445_status")
    private Boolean t445_status;
}
