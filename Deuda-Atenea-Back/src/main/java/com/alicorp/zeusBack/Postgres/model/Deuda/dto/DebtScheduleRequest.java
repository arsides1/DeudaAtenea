package com.alicorp.zeusBack.Postgres.model.Deuda.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DebtScheduleRequest {

    private Long id;
    private Integer paymentNumber;
    private Integer calculationDate;
    private Integer paymentDate;
    private BigDecimal initialBalance;
    private BigDecimal finalBalance;
    private BigDecimal amortization;
    private BigDecimal interest;
    private BigDecimal interestRate;
    private Integer variableRateDate;
    private BigDecimal appliedRate;
    private BigDecimal termSofrAdj;
    private BigDecimal applicableMargin;
    private BigDecimal installment;
    private String finalGuarantor;
    private String registeredBy;
    private String rateType;
    private String referenceRate;
    private String provider;
    private Integer acceptanceDate;
    private BigDecimal fees;
    private BigDecimal insurance;
}
