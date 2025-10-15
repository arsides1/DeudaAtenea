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
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "t534_amortization_method", schema = "public")
public class AmortizationMethod {
    @Id
    @Column(name = "t534_id")
    private Integer t534Id;

    @Column(name = "t534_description")
    private String t534Description;

    @Column(name = "t534_status")
    private Boolean t534Status;
}
