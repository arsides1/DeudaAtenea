package com.alicorp.zeusBack.SQL.service.Tesoreria;

import com.alicorp.zeusBack.SQL.model.Tesoreria.Holiday;
import com.alicorp.zeusBack.SQL.repo.Tesoreria.HolidayRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TesoreriaServiceSQL {
    private final HolidayRepo holidayRepo;

    public List<Holiday> listaFeriados(){
        return holidayRepo.findAll().stream().filter(e -> e.getStatus() == 1).collect(Collectors.toList());
    }
}
