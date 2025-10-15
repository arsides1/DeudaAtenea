package com.alicorp.zeusBack.Postgres.repo.Deuda;

import com.alicorp.zeusBack.Postgres.model.Deuda.AmortizationRateException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface AmortizationRateExceptionRepository extends JpaRepository<AmortizationRateException, Integer> {

    List<AmortizationRateException> findByDebtRegistryId(String debtRegistryId);

    @Modifying
    @Transactional
    @Query("DELETE FROM AmortizationRateException e WHERE e.debtRegistryId = :debtRegistryId")
    void deleteByDebtRegistryId(@Param("debtRegistryId") String debtRegistryId);

    @Query("SELECT e FROM AmortizationRateException e WHERE e.debtRegistryId = :debtRegistryId AND e.status = true ORDER BY e.cuotaExc")
    List<AmortizationRateException> findActiveByDebtRegistryId(@Param("debtRegistryId") String debtRegistryId);
}
