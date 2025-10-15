package com.alicorp.zeusBack.Postgres.repo.Tesoreria;

import com.alicorp.zeusBack.Postgres.model.Tesoreria.ModificationHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModificationHistoryRepo extends JpaRepository<ModificationHistory, Integer> {
}
