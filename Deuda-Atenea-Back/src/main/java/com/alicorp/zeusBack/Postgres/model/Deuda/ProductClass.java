package com.alicorp.zeusBack.Postgres.model.Deuda;

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
@Table(name="t547_product_class", schema="public")
public class ProductClass {
    @Column(name = "t547_id")
    @Id
    private Integer id;

    @Column(name = "t547_description")
    private String description;

    @Column(name = "t547_status")
    private Boolean status;
}