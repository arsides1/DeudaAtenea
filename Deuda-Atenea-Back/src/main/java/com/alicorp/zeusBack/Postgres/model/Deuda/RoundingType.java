package com.alicorp.zeusBack.Postgres.model.Deuda;

import lombok.*;
import javax.persistence.*;

@Entity
@Table(name = "t544_rounding_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoundingType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "t544_id")
    private Integer id;

    @Column(name = "t544_description", length = 50)
    private String description;

    @Column(name = "t544_status")
    private Boolean status = true;
}
