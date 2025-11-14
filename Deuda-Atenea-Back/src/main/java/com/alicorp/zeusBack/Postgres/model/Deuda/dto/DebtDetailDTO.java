package com.alicorp.zeusBack.Postgres.model.Deuda.dto;

import com.alicorp.zeusBack.Postgres.model.Deuda.DebtSchedule;
import com.alicorp.zeusBack.Postgres.model.Deuda.AmortizationRateException;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DebtDetailDTO {
    private Integer productClassId;
    private Integer productTypeId;
    private Integer productNameId;

    private String id;

    private Integer amortizationStartDate;
    private Integer rateExpressionTypeId;
    private Integer amortizationTypeId;

    private Integer subsidiaryDebtorId;
    private String creditorType;
    private Integer subsidiaryCreditorId;
    private Integer counterpartCreditorId;
    private Integer validityStartDate;
    private Integer disbursementDate;
    private Integer interestStartDate;
    private Integer maturityDate;
    private String currencyId;
    private BigDecimal nominal;
    private BigDecimal amortizationRate;
    private Integer amortizationStartPayment;
    private Integer periodsId;
    private Integer rateClassificationId;
    private BigDecimal fixedRatePercentage;
    private String referenceRate;
    private BigDecimal rateAdjustment;
    private BigDecimal applicableMargin;
    private BigDecimal others;
    private Boolean applyAmortizationException;
    private BigDecimal operationTrm;
    private Integer basisId;
    private String rateTypeId;
    private Integer amortizationMethodId;
    private Integer roundingTypeId;
    private Integer interestStructureId;

    private String portfolio;
    private String project;
    private String assignment;
    private String internalReference;
    private String characteristics;

    private Integer subsidiaryGuarantorId;
    private String merchant;
    private String valuationCategory;
    private String externalReference;
    private BigDecimal structuringCost;
    // ========== NUEVOS CAMPOS TRM (2025-11-14) ==========
    private String financialProject;
    private String netPresentValueCalc;
    private BigDecimal costAmount;
    private String structuringCostCurrency;
    // ========== FIN NUEVOS CAMPOS TRM ==========
    private Integer debtStatus;
    private String registeredBy;
    private LocalDateTime registrationDate;

    private String subsidiaryDebtorName;
    private String subsidiaryCreditorName;
    private String counterpartCreditorName;
    private String productNameName;
    private String currencyName;
    private String periodsName;
    private String rateClassificationName;
    private String basisName;
    private String rateTypeName;
    private String amortizationMethodName;
    private String roundingTypeName;
    private String interestStructureName;
    private String subsidiaryGuarantorName;

    private List<DebtSchedule> schedules;
    private List<AmortizationRateException> amortizationExceptions;
}