package com.alicorp.zeusBack.Postgres.repo.Tesoreria;

import com.alicorp.zeusBack.Postgres.model.Tesoreria.OpcionesCombo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OpcionesComboRepo extends JpaRepository<OpcionesCombo, Integer> {
    @Query(value = "select * from f002_consultar_combo(:codigo)",nativeQuery = true)
    List<OpcionesCombo> listaCombo(@Param("codigo") int codigo);
}
