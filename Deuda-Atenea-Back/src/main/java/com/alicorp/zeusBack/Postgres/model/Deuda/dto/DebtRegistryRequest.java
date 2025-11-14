package com.alicorp.zeusBack.Postgres.model.Deuda.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DebtRegistryRequest {

    private String id;

    @NotBlank(message = "La clase de producto es obligatoria")
    private Integer productClassId;

    @NotBlank(message = "El tipo de producto es obligatorio")
    private Integer productTypeId;

    private Integer productNameId;
    private String productName;

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
    private Boolean applyAmortizationException = false;
    private List<AmortizationExceptionRequest> amortizationExceptions;
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

    // ========== CAMPOS ADICIONALES (TRM) ==========
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
    private List<DebtScheduleRequest> schedules;
}