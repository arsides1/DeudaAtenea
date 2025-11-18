package com.alicorp.zeusBack.Postgres.service.Deuda;


import com.alicorp.zeusBack.Postgres.repo.Deuda.FactorRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
public class VariableRateService {

    @Autowired
    private FactorRepository factorRepository;

    public BigDecimal getSofrRate(Integer variableRateDate) {
        if (variableRateDate == null) {
            return null;
        }

        try {
            String fechaStr = formatDateIntToString(variableRateDate);
            Double rate = factorRepository.findSofrRateByDate(fechaStr);

            if (rate == null) {
                log.warn("No se encontró tasa SOFR para fecha {}", fechaStr);
                return null;
            }

            return BigDecimal.valueOf(rate);

        } catch (Exception e) {
            log.error("Error obteniendo tasa SOFR: {}", e.getMessage());
            return null;
        }
    }

    private String formatDateIntToString(Integer dateInt) {
        String s = String.valueOf(dateInt);
        return s.substring(0, 4) + "-" + s.substring(4, 6) + "-" + s.substring(6, 8);
    }
}