package com.alicorp.zeusBack.Postgres.model.Deuda.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AmortizationExceptionRequest {

    private Integer id; // Para actualizaciones


    private Integer cuotaExc;


    private BigDecimal amortizationRate;


    private BigDecimal resultado;

    private String registeredBy;
}
