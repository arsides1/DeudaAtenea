package com.alicorp.zeusBack.SQL.repo.Tesoreria;

import com.alicorp.zeusBack.SQL.model.Tesoreria.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HolidayRepo extends JpaRepository<Holiday, Integer> {
}
