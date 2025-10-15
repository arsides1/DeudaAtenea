package com.alicorp.zeusBack.Postgres.model.Tesoreria;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name="t476_coupon_co", schema="public")
public class CuponOC {
    @Column(name = "t476_id")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "t476_id_coverage_object")
    private String id_co;
    @Column(name = "t476_start_date")
    private Integer start_date;
    @Column(name = "t476_end_date")
    private Integer end_date;
    @Column(name = "t476_interest")
    private BigDecimal coupon;
    @Column(name = "t476_amortization")
    private BigDecimal amortization;
    @Column(name = "t476_residue")
    private BigDecimal residue;
}
