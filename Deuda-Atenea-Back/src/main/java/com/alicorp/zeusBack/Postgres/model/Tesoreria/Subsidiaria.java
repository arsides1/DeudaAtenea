package com.alicorp.zeusBack.Postgres.model.Tesoreria;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name="t453_subsidiary", schema="public")
public class Subsidiaria {
    @Column(name = "t453_id")
    @Id
    private Integer t453Id;
    @Column(name = "t453_description")
    private String t453Description;
    @Column(name = "t453_country")
    private String t453Country;
    @Column(name = "t453_currency")
    private String t453Currency;
    @Column(name = "t453_status")
    private Boolean t453Status;
    @Column(name = "t453_status_black_list")
    private Boolean t453StatusBlackList;
    @Column(name = "t453_description_treasury")
    private String t453DescriptionTreasury;
}
