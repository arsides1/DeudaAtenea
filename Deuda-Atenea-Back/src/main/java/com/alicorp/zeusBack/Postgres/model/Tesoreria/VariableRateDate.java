package com.alicorp.zeusBack.Postgres.model.Tesoreria;

import lombok.*;
import javax.persistence.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "t531_variable_rate_date", schema = "public")
public class VariableRateDate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "t531_id_debt")
    private Integer id;

    @Column(name = "t510_id", nullable = false)
    private Integer debtId; // FK -> t532_debt.t510_id

    @Column(name = "t509_date", nullable = false)
    private LocalDate date;

    @Column(name = "t509_status", nullable = false)
    private Boolean status = Boolean.TRUE;
}
