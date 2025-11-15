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
@Table(name="t459_counterpart", schema="public")
public class Contraparte {
    @Column(name = "t459_id")
    @Id
    private Integer t459_id;
    @Column(name = "t459_deal_code")
    private String t459_deal_code;
    @Column(name = "t459_description")
    private String t459_description;
    @Column(name = "t459_status")
    private Boolean t459_status;
    @Column(name = "t459_country")
    private String t459_country;
}
