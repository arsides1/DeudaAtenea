package com.alicorp.zeusBack.Postgres.model.Tesoreria;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CuponOC_FacturaCompleto {
    private FacturaCompleto objCO;
    private List<CuponOC> listCupon;
    private Boolean flgDesembolso;
}
