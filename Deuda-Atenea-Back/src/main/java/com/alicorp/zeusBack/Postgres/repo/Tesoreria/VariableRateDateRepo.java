package com.alicorp.zeusBack.Postgres.repo.Tesoreria;

import com.alicorp.zeusBack.Postgres.model.Tesoreria.VariableRateDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface VariableRateDateRepo extends JpaRepository<VariableRateDate, Integer> {
    List<VariableRateDate> findByDebtId(Integer debtId);

    @Modifying
    @Transactional
    @Query("delete from VariableRateDate v where v.debtId = :debtId")
    void deleteByDebtId(@Param("debtId") Integer debtId);

    List<VariableRateDate> findAllByDebtIdOrderByDateAsc(Integer debtId); // mapea @Column(name="t510_id")
}
