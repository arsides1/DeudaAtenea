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
    // CAMPOS NUEVOS - Información del producto
    private Integer productClassId;
    private Integer productTypeId;

    // Datos principales - Solo lo que está en BD
    private String id;
    private Integer subsidiaryDebtorId;
    private String creditorType;
    private Integer subsidiaryCreditorId;
    private Integer counterpartCreditorId;
    private Integer productNameId;
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

    // Campos opcionales
    private String portfolio;
    private String project;
    private String assignment;
    private String internalReference;
    private String characteristics;

    // Metadatos
    private Boolean status;
    private String registeredBy;
    private LocalDateTime registrationDate;

    // Descripciones para mostrar
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

    // Cronograma completo tal como viene del frontend
    private List<DebtSchedule> schedules;

    // Excepciones de amortización
    private List<AmortizationRateException> amortizationExceptions;
}