package com.alicorp.zeusBack.Postgres.model.Deuda;

import lombok.*;
import javax.persistence.*;

@Entity
@Table(name = "t545_interest_structure")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterestStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "t545_id")
    private Integer id;

    @Column(name = "t545_description", length = 50)
    private String description;

    @Column(name = "t545_status")
    private Boolean status = true;
}