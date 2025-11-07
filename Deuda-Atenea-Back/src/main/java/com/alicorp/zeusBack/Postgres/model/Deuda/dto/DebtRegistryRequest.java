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

    // SOLO ESTOS DOS CAMPOS SON OBLIGATORIOS
    @NotBlank(message = "La clase de producto es obligatoria")
    private Integer productClassId;

    @NotBlank(message = "El tipo de producto es obligatorio")
    private Integer productTypeId;

    // CAMPOS DE NOMBRE DE PRODUCTO
    private Integer productNameId;  // ID si ya existe
    private String productName;     // Nombre/descripción del producto (para crear nuevo si no existe)

    // TODOS LOS DEMÁS CAMPOS SIN VALIDACIONES
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

    // ========== CAMPOS ADICIONALES (TRM) - NUEVOS ==========
    private Integer subsidiaryGuarantorId;
    private String merchant;
    private String valuationCategory;
    private String externalReference;
    private BigDecimal structuringCost;
    // ========== FIN CAMPOS ADICIONALES (TRM) ==========

    private String registeredBy;
    private List<DebtScheduleRequest> schedules;
}