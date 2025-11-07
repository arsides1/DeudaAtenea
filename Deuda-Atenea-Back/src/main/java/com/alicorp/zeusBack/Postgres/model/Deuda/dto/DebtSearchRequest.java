package com.alicorp.zeusBack.Postgres.model.Deuda.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DebtSearchRequest {
    // Búsqueda por texto libre
    private String searchText;

    // Filtros de texto
    private String productClassId;
    private String productTypeId;
    private Integer loanTypeId;
    private Integer productNameId;  // AGREGAR ESTE CAMPO
    private String currencyId;
    private String rateTypeId;
    private String referenceRate;
    private String portfolio;
    private String project;
    private String assignment;
    private String internalReference;

    // Filtros numéricos
    private Integer subsidiaryDebtorId;
    private Integer subsidiaryCreditorId;
    private Integer counterpartCreditorId;
    private Integer periodsId;
    private Integer rateClassificationId;
    private Integer basisId;
    private Integer amortizationMethodId;
    private Integer roundingTypeId;
    private Integer interestStructureId;

    // Rangos de fechas (formato YYYYMMDD)
    private Integer validityStartDateFrom;
    private Integer validityStartDateTo;
    private Integer disbursementDateFrom;
    private Integer disbursementDateTo;
    private Integer interestStartDateFrom;
    private Integer interestStartDateTo;
    private Integer maturityDateFrom;
    private Integer maturityDateTo;

    // Rangos numéricos
    private BigDecimal nominalMin;
    private BigDecimal nominalMax;
    private BigDecimal amortizationRateMin;
    private BigDecimal amortizationRateMax;
    private BigDecimal operationTrmMin;
    private BigDecimal operationTrmMax;
    private BigDecimal rateAdjustmentMin;
    private BigDecimal rateAdjustmentMax;
    private BigDecimal applicableMarginMin;
    private BigDecimal applicableMarginMax;

    // Filtros booleanos
    private Boolean applyAmortizationException;
    private String debtState;

    // Filtro por usuario
    private String registeredBy;

    // Rangos de fecha de registro
    private LocalDateTime registrationDateFrom;
    private LocalDateTime registrationDateTo;

    // Paginación
    private int page = 0;
    private int size = 10;
    private String sortBy = "registrationDate";
    private String sortDirection = "DESC";
}