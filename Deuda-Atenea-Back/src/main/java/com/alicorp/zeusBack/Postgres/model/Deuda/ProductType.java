package com.alicorp.zeusBack.Postgres.model.Deuda;
import lombok.*;
import javax.persistence.*;

@Entity
@Table(name = "t551_product_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductType {

    @Id
    @Column(name = "t551_id")
    private Integer id;

    @Column(name = "t551_id_product_class")
    private Integer productClassId;

    @Column(name = "t551_description")
    private String description;

    @Column(name = "t551_status")
    private Boolean status;

    // Relación con ProductClass (opcional pero útil)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t551_id_product_class", insertable = false, updatable = false)
    private ProductClass productClass;
}
