package com.alicorp.zeusBack.Postgres.repo.Tesoreria;

import com.alicorp.zeusBack.Postgres.model.Tesoreria.Moneda;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MonedaRepo extends JpaRepository<Moneda, String> {
}
