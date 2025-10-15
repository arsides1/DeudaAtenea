package com.alicorp.zeusBack.Postgres.model.Deuda;

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "t508_amortization_rate_exc")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AmortizationRateException {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "t508_id")
    private Integer id;

    @NotNull
    @Column(name = "t508_id_debt_registry", length = 11)
    private String debtRegistryId;

    @NotNull
    @Column(name = "t508_cuota_exc")
    private Integer cuotaExc;

    @NotNull
    @Column(name = "t508_amortization_rate", precision = 10, scale = 6)
    private BigDecimal amortizationRate;

    @NotNull
    @Column(name = "t508_resultado", precision = 18, scale = 6)
    private BigDecimal resultado;

    @Column(name = "t508_status")
    private Boolean status = true;

    @Column(name = "t508_registered_by", length = 25)
    private String registeredBy;

    @Column(name = "t508_registration_date")
    private LocalDateTime registrationDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t508_id_debt_registry", insertable = false, updatable = false)
    @JsonBackReference
    private DebtRegistry debtRegistry;

    @PrePersist
    protected void onCreate() {
        registrationDate = LocalDateTime.now();
        if (status == null) {
            status = true;
        }
    }
}