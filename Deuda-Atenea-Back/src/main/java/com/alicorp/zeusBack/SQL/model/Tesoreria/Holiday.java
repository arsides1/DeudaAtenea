package com.alicorp.zeusBack.SQL.model.Tesoreria;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Entity
@IdClass(HolidayIDs.class)
@Table(name="T017_Holiday")
public class Holiday {
    @Column(name = "T017_DateKey")
    @Id
    private Integer date_key;
    @Column(name = "T017_Country")
    @Id
    private String country;
    @Column(name = "T017_Status")
    private Integer status;
    @Column(name = "T017_HolidayConcept")
    private Integer holiday_concept;
}
