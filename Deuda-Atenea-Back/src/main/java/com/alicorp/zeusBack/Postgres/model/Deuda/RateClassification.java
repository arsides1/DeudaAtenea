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
@Table(name = "t506_rate_classification", schema = "public")
public class RateClassification {
    @Id
    @Column(name = "t506_id")
    private Integer t506Id;

    @Column(name = "t506_description")
    private String t506Description;

    @Column(name = "t506_status")
    private Boolean t506Status;
}
