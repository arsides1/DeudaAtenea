package com.alicorp.zeusBack.Postgres.model.Deuda.dto;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SofrRateResponse {
    private Integer fecha;
    private BigDecimal sofrRate;
}