package com.alicorp.zeusBack.Postgres.model.Deuda;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "t450_periods", schema = "public")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Periods {
    @Id
    @Column(name = "t450_id")
    private Integer t450Id;

    @Column(name = "t450_description")
    private String t450Description;

    @Column(name = "t450_code_bbg")
    private Integer t450CodeBbg;

    @Column(name = "t450_status")
    private Boolean t450Status;
}
