package com.alicorp.zeusBack.Postgres.model.Deuda.dto;

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
@Table(name = "t529_loan_type", schema = "public")
public class LoanType {
    @Id
    @Column(name = "t507_id")
    private Integer t507Id;

    @Column(name = "t507_description")
    private String t507Description;

    @Column(name = "t507_status")
    private Boolean t507Status;
}
