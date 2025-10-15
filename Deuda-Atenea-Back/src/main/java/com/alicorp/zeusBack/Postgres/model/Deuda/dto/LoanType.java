package com.alicorp.zeusBack.Postgres.model.Deuda.dto;

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
