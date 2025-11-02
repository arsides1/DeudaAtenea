package com.alicorp.zeusBack.Postgres.model.Deuda.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    private Integer seq;
    private Integer paymentNumber;
    @JsonProperty("calculationDate")
    private Integer periodDate;         // calculationDate en BD
    private Integer paymentDate;
    @JsonProperty("initialBalance")
    private BigDecimal nominalOpening;    // initialBalance en BD
    @JsonProperty("finalBalance")
    private BigDecimal nominalClosing;     // finalBalance en BD
    private BigDecimal nominal;
    private BigDecimal prepayment;
    @JsonProperty("amortization")
    private BigDecimal amortizationPrinc;  // amortization en BD
    @JsonProperty("interest")
    private BigDecimal interestPaid;       // interest en BD
    @JsonProperty("interestRate")
    private BigDecimal rate;              // interestRate y appliedRate en BD
    private Integer variableRateDate;
    private BigDecimal rateAdjustment;
    private BigDecimal applicableMargin;
    @JsonProperty("installment")
    private BigDecimal fee;                // installment en BD
    private Object finalGuarantor;          // puede ser String o Number
    private BigDecimal insurance;
    private String rateType;
    private String referenceRate;
    private String provider;
    private Integer acceptanceDate;
    private BigDecimal fees;
    private Boolean status;
    private String registeredBy;

    // =====================================================
    // CAMPOS NUEVOS PARA TIPO DE PAGO
    // =====================================================

    /**
     * ID del tipo de pago
     * 1 = NORMAL (Cuota Normal)
     * 2 = PREPAGO_PARCIAL (Prepago Parcial)
     * 3 = PREPAGO_TOTAL (Prepago Total)
     */
    private Integer paymentTypeId = 1;

    /**
     * Descripción adicional cuando es prepago
     * Ejemplo: "Prepago por excedente de caja"
     */
    private String prepaymentDescription;

    /**
     * Fecha efectiva del prepago en formato YYYYMMDD
     * Solo aplica cuando paymentTypeId es 2 o 3
     */
    private Integer prepaymentDate;
}