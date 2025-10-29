package com.alicorp.zeusBack.Postgres.model.Deuda;

import lombok.*;
import javax.persistence.*;

@Entity
@Table(name = "t552_product_name")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductName {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "t552_id")
    private Integer id;

    @Column(name = "t552_id_product_type", nullable = false)
    private Integer productTypeId;

    @Column(name = "t552_description", nullable = false, length = 100)
    private String description;

    @Column(name = "t552_code", length = 20)
    private String code;

    @Column(name = "t552_status")
    private Boolean status = true;
}