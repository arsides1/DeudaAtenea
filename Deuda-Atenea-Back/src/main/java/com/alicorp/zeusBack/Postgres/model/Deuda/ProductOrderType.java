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
@Table(name="t546_product_order_type", schema="public")
public class ProductOrderType {
    @Column(name = "t546_id")
    @Id
    private String t546_id;

    @Column(name = "t546_description")
    private String t546_description;

    @Column(name = "t546_status")
    private Boolean t546_status;
}