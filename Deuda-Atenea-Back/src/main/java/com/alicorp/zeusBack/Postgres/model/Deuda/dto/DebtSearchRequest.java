package com.alicorp.zeusBack.Postgres.model.Deuda.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DebtSearchRequest {
    // Búsqueda por texto libre
    private String searchText;

    // Filtros de texto - se buscarán con LIKE
    private String productClassId;
    private String productTypeId;
    private String currencyId;
    private String rateTypeId;
    private String referenceRate;
    private String portfolio;
    private String project;
    private String assignment;
    private String internalReference;

    // Filtros numéricos - comparación exacta
    private Integer subsidiaryDebtorId;
    private Integer subsidiaryCreditorId;
    private Integer counterpartCreditorId;
    private Integer loanTypeId;
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
    private BigDecimal termSofrAdjMin;
    private BigDecimal termSofrAdjMax;
    private BigDecimal applicableMarginMin;
    private BigDecimal applicableMarginMax;

    // Estado y otros
    private Boolean applyAmortizationException;
    private Boolean status;
    private String registeredBy;
    private LocalDateTime registrationDateFrom;
    private LocalDateTime registrationDateTo;

    // Paginación
    private Integer page = 0;
    private Integer size = 10;
    private String sortBy = "registrationDate";
    private String sortDirection = "DESC";
}