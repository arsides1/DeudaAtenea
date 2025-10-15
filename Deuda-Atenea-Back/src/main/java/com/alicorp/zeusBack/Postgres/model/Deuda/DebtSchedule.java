package com.alicorp.zeusBack.Postgres.model.Deuda;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "t533_debt_schedule")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DebtSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "t533_id")
    private Long id;

    @NotNull
    @Column(name = "t533_id_debt_registry", length = 11)
    private String debtRegistryId;

    @NotNull
    @Column(name = "t533_payment_number")
    private Integer paymentNumber;

    @NotNull
    @Column(name = "t533_calculation_date")
    private Integer calculationDate;

    @NotNull
    @Column(name = "t533_payment_date")
    private Integer paymentDate;

    @NotNull
    @Column(name = "t533_initial_balance", precision = 18, scale = 2)
    private BigDecimal initialBalance;

    @NotNull
    @Column(name = "t533_final_balance", precision = 18, scale = 2)
    private BigDecimal finalBalance;

    @NotNull
    @Column(name = "t533_amortization", precision = 18, scale = 2)
    private BigDecimal amortization;

    @NotNull
    @Column(name = "t533_interest", precision = 18, scale = 2)
    private BigDecimal interest;

    @NotNull
    @Column(name = "t533_interest_rate", precision = 8, scale = 4)
    private BigDecimal interestRate;

    @Column(name = "t533_variable_rate_date")
    private Integer variableRateDate;

    @Column(name = "t533_applied_rate", precision = 8, scale = 4)
    private BigDecimal appliedRate;

    @Column(name = "t533_term_sofr_adj", precision = 8, scale = 4)
    private BigDecimal termSofrAdj;

    @Column(name = "t533_applicable_margin", precision = 8, scale = 4)
    private BigDecimal applicableMargin;

    @NotNull
    @Column(name = "t533_installment", precision = 18, scale = 2)
    private BigDecimal installment;

    @Column(name = "t533_final_guarantor", length = 100)
    private String finalGuarantor;

    @Column(name = "t533_status")
    private Boolean status = true;

    @NotBlank
    @Column(name = "t533_registered_by", length = 25)
    private String registeredBy;

    @Column(name = "t533_registration_date")
    private LocalDateTime registrationDate;

    // CAMPOS NUEVOS AGREGADOS
    @Column(name = "t533_rate_type", length = 20)
    private String rateType;

    @Column(name = "t533_reference_rate", length = 50)
    private String referenceRate;

    @Column(name = "t533_provider", length = 100)
    private String provider;

    @Column(name = "t533_acceptance_date")
    private Integer acceptanceDate;

    @Column(name = "t533_fees", precision = 18, scale = 2)
    private BigDecimal fees;

    @Column(name = "t533_insurance", precision = 18, scale = 2)
    private BigDecimal insurance;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t533_id_debt_registry", insertable = false, updatable = false)
    private DebtRegistry debtRegistry;

    @PrePersist
    protected void onCreate() {
        registrationDate = LocalDateTime.now();
    }
}