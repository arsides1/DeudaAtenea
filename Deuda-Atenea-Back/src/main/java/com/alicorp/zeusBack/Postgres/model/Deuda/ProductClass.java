package com.alicorp.zeusBack.Postgres.model.Deuda;

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