package com.alicorp.zeusBack.Postgres.model.Deuda;

import com.alicorp.zeusBack.Postgres.model.Tesoreria.Basis;
import com.alicorp.zeusBack.Postgres.model.Tesoreria.Moneda;
import com.alicorp.zeusBack.Postgres.model.Tesoreria.Subsidiaria;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.alicorp.zeusBack.Postgres.model.Tesoreria.*;

@Entity
@Table(name = "t532_debt_registry")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DebtRegistry {

    @Id
    @Column(name = "t532_id", length = 11)
    private String id;

    @NotNull
    @Column(name = "t532_id_subsidiary_debtor")
    private Integer subsidiaryDebtorId;

    @Column(name = "t532_creditor_type", length = 20)
    private String creditorType;

    @Column(name = "t532_id_subsidiary_creditor")
    private Integer subsidiaryCreditorId;

    @Column(name = "t532_id_counterpart_creditor")
    private Integer counterpartCreditorId;

    @Column(name = "t532_id_product_name")
    private Integer productNameId;

    @NotNull
    @Column(name = "t532_validity_start_date")
    private Integer validityStartDate;

    @NotNull
    @Column(name = "t532_disbursement_date")
    private Integer disbursementDate;

    @NotNull
    @Column(name = "t532_interest_start_date")
    private Integer interestStartDate;

    @NotNull
    @Column(name = "t532_maturity_date")
    private Integer maturityDate;

    @NotNull
    @Column(name = "t532_id_currency", length = 10)
    private String currencyId;

    @NotNull
    @Column(name = "t532_nominal", precision = 18, scale = 2)
    private BigDecimal nominal;

    @NotNull
    @Column(name = "t532_amortization_rate", precision = 5, scale = 2)
    private BigDecimal amortizationRate;

    @NotNull
    @Column(name = "t532_amortization_start_payment")
    private Integer amortizationStartPayment;

    @NotNull
    @Column(name = "t532_id_periods")
    private Integer periodsId;

    @NotNull
    @Column(name = "t532_id_rate_classification")
    private Integer rateClassificationId;

    @Column(name = "t532_fixed_rate_percentage", precision = 8, scale = 4)
    private BigDecimal fixedRatePercentage;

    @Column(name = "t532_reference_rate", length = 20)
    private String referenceRate;

    @Column(name = "t532_rate_adjustment", precision = 8, scale = 4)
    private BigDecimal rateAdjustment;

    @Column(name = "t532_applicable_margin", precision = 8, scale = 4)
    private BigDecimal applicableMargin;

    @Column(name = "t532_others", precision = 8, scale = 4)
    private BigDecimal others;

    @Column(name = "t532_apply_amortization_exception")
    private Boolean applyAmortizationException = false;

    @Column(name = "t532_operation_trm", precision = 18, scale = 6)
    private BigDecimal operationTrm;

    @NotNull
    @Column(name = "t532_id_basis")
    private Integer basisId;

    @NotNull
    @Column(name = "t532_id_rate_type", length = 5)
    private String rateTypeId;

    @NotNull
    @Column(name = "t532_id_amortization_method")
    private Integer amortizationMethodId;

    @Column(name = "t532_id_rounding_type")
    private Integer roundingTypeId;

    @Column(name = "t532_id_interest_structure")
    private Integer interestStructureId;

    @Column(name = "t532_portfolio", length = 100)
    private String portfolio;

    @Column(name = "t532_project", length = 100)
    private String project;

    @Column(name = "t532_assignment", length = 100)
    private String assignment;

    @Column(name = "t532_internal_reference", length = 100)
    private String internalReference;

    @Column(name = "t532_characteristics")
    private String characteristics;

    // ========== CAMPOS ADICIONALES (TRM) - NUEVOS ==========
    @Column(name = "t532_id_subsidiary_guarantor")
    private Integer subsidiaryGuarantorId;

    @Column(name = "t532_merchant", length = 100)
    private String merchant;

    @Column(name = "t532_valuation_category", length = 100)
    private String valuationCategory;

    @Column(name = "t532_external_reference", length = 200)
    private String externalReference;

    @Column(name = "t532_structuring_cost", precision = 18, scale = 2)
    private BigDecimal structuringCost;
    // ========== FIN CAMPOS ADICIONALES (TRM) ==========

    @Column(name = "t532_debt_state", length = 20)
    private String debtState = "ACTIVO";

    @NotBlank
    @Column(name = "t532_registered_by", length = 25)
    private String registeredBy;

    @Column(name = "t532_registration_date")
    private LocalDateTime registrationDate;

    // CAMPOS NUEVOS AGREGADOS ANTERIORMENTE
    @NotNull
    @Column(name = "t532_id_product_class")
    private Integer productClassId;

    @NotNull
    @Column(name = "t532_id_product_type")
    private Integer productTypeId;

    @Column(name = "t532_amortization_start_date")
    private Integer amortizationStartDate;

    @Column(name = "t532_id_rate_expression_type", length = 3)
    private Integer rateExpressionTypeId;

    @Column(name = "t532_id_amortization_type", length = 10)
    private Integer amortizationTypeId;

    // RELACIONES JPA
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t532_id_subsidiary_debtor", insertable = false, updatable = false)
    private Subsidiaria subsidiaryDebtor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t532_id_subsidiary_creditor", insertable = false, updatable = false)
    private Subsidiaria subsidiaryCreditor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t532_id_counterpart_creditor", insertable = false, updatable = false)
    private Contraparte counterpartCreditor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t532_id_currency", insertable = false, updatable = false)
    private Moneda currency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t532_id_basis", insertable = false, updatable = false)
    private Basis basis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t532_id_periods", insertable = false, updatable = false)
    private Periods periods;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t532_id_rate_type", insertable = false, updatable = false)
    private RateType rateType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t532_id_rate_classification", insertable = false, updatable = false)
    private RateClassification rateClassification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t532_id_amortization_method", insertable = false, updatable = false)
    private AmortizationMethod amortizationMethod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t532_id_rounding_type", insertable = false, updatable = false)
    private RoundingType roundingType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t532_id_interest_structure", insertable = false, updatable = false)
    private InterestStructure interestStructure;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t532_id_product_name", insertable = false, updatable = false)
    private ProductName productName;

    // ========== RELACIÓN NUEVA: GARANTE ==========
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t532_id_subsidiary_guarantor", insertable = false, updatable = false)
    private Subsidiaria subsidiaryGuarantor;
    // ========== FIN RELACIÓN NUEVA ==========

    @OneToMany(mappedBy = "debtRegistry", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<DebtSchedule> schedules;

    @OneToMany(mappedBy = "debtRegistry", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<AmortizationRateException> amortizationExceptions;

}