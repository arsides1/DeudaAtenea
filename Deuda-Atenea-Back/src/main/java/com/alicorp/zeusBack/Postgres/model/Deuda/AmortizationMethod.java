package com.alicorp.zeusBack.Postgres.model.Deuda;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

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
