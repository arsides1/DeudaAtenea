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
@Table(name = "t449_rate_type", schema = "public")
public class RateType {
    @Id
    @Column(name = "t449_id", length = 5)
    private String t449Id;

    @Column(name = "t449_description")
    private String t449Description;

    @Column(name = "t449_status")
    private Boolean t449Status;
}
