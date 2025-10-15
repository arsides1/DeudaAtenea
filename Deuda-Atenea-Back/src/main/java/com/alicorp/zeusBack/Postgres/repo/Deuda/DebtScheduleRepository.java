package com.alicorp.zeusBack.Postgres.repo.Deuda;

import com.alicorp.zeusBack.Postgres.model.Deuda.DebtSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface DebtScheduleRepository extends JpaRepository<DebtSchedule, Long> {

    List<DebtSchedule> findByDebtRegistryIdOrderByPaymentNumberAsc(String debtRegistryId);

    @Modifying
    @Transactional
    @Query("DELETE FROM DebtSchedule s WHERE s.debtRegistryId = :debtRegistryId")
    void deleteByDebtRegistryId(@Param("debtRegistryId") String debtRegistryId);
}