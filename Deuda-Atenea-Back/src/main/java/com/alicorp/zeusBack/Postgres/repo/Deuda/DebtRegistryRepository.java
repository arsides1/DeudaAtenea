package com.alicorp.zeusBack.Postgres.repo.Deuda;

import com.alicorp.zeusBack.Postgres.model.Deuda.DebtRegistry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface DebtRegistryRepository extends JpaRepository<DebtRegistry, String> {

    @Query("SELECT DISTINCT d FROM DebtRegistry d " +
            "LEFT JOIN FETCH d.subsidiaryDebtor " +
            "LEFT JOIN FETCH d.subsidiaryCreditor " +
            "LEFT JOIN FETCH d.counterpartCreditor " +
            "LEFT JOIN FETCH d.currency " +
            "LEFT JOIN FETCH d.loanType " +
            "LEFT JOIN FETCH d.periods " +
            "LEFT JOIN FETCH d.rateClassification " +
            "LEFT JOIN FETCH d.basis " +
            "LEFT JOIN FETCH d.rateType " +
            "LEFT JOIN FETCH d.amortizationMethod " +
            "LEFT JOIN FETCH d.roundingType " +
            "LEFT JOIN FETCH d.interestStructure " +
            "WHERE d.id = :id")
    Optional<DebtRegistry> findByIdWithAllRelations(@Param("id") String id);

    @Query(value = "SELECT d FROM DebtRegistry d " +
            "LEFT JOIN FETCH d.subsidiaryDebtor " +
            "LEFT JOIN FETCH d.subsidiaryCreditor " +
            "LEFT JOIN FETCH d.counterpartCreditor " +
            "LEFT JOIN FETCH d.loanType " +
            "LEFT JOIN FETCH d.periods " +
            "LEFT JOIN FETCH d.rateClassification " +
            "LEFT JOIN FETCH d.basis " +
            "LEFT JOIN FETCH d.rateType " +
            "LEFT JOIN FETCH d.amortizationMethod " +
            "WHERE d.status = true",
            countQuery = "SELECT COUNT(d) FROM DebtRegistry d WHERE d.status = true")
    Page<DebtRegistry> findByStatusTrueWithRelations(Pageable pageable);

    Optional<DebtRegistry> findByIdAndStatusTrue(String id);
    @Query("SELECT DISTINCT d FROM DebtRegistry d " +
            "LEFT JOIN d.subsidiaryDebtor sd " +
            "LEFT JOIN d.subsidiaryCreditor sc " +
            "LEFT JOIN d.counterpartCreditor cc " +
            "LEFT JOIN d.loanType lt " +
            "LEFT JOIN d.currency cur " +
            "LEFT JOIN d.periods per " +
            "LEFT JOIN d.rateClassification rc " +
            "WHERE " +
            "(:searchText IS NULL OR :searchText = '' OR " +
            "    LOWER(d.id) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
            "    LOWER(d.productClassId) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
            "    LOWER(d.productTypeId) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
            "    LOWER(d.portfolio) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
            "    LOWER(d.project) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
            "    LOWER(d.assignment) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
            "    LOWER(d.internalReference) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
            "    LOWER(d.characteristics) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
            "    LOWER(sd.t453DescriptionTreasury) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
            "    LOWER(sc.t453DescriptionTreasury) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
            "    LOWER(cc.t459_description) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
            "    LOWER(cur.t064Description) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
            "    LOWER(lt.t507Description) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
            "    CAST(d.nominal AS string) LIKE CONCAT('%', :searchText, '%') OR " +
            "    LOWER(d.registeredBy) LIKE LOWER(CONCAT('%', :searchText, '%'))) " +
            "AND (:productClassId IS NULL OR :productClassId = '' OR " +
            "     LOWER(d.productClassId) LIKE LOWER(CONCAT('%', :productClassId, '%'))) " +
            "AND (:productTypeId IS NULL OR :productTypeId = '' OR " +
            "     LOWER(d.productTypeId) LIKE LOWER(CONCAT('%', :productTypeId, '%'))) " +
            "AND (:currencyId IS NULL OR :currencyId = '' OR " +
            "     LOWER(d.currencyId) LIKE LOWER(CONCAT('%', :currencyId, '%'))) " +
            "AND (:rateTypeId IS NULL OR :rateTypeId = '' OR " +
            "     LOWER(d.rateTypeId) LIKE LOWER(CONCAT('%', :rateTypeId, '%'))) " +
            "AND (:referenceRate IS NULL OR :referenceRate = '' OR " +
            "     LOWER(d.referenceRate) LIKE LOWER(CONCAT('%', :referenceRate, '%'))) " +
            "AND (:portfolio IS NULL OR :portfolio = '' OR " +
            "     LOWER(d.portfolio) LIKE LOWER(CONCAT('%', :portfolio, '%'))) " +
            "AND (:project IS NULL OR :project = '' OR " +
            "     LOWER(d.project) LIKE LOWER(CONCAT('%', :project, '%'))) " +
            "AND (:assignment IS NULL OR :assignment = '' OR " +
            "     LOWER(d.assignment) LIKE LOWER(CONCAT('%', :assignment, '%'))) " +
            "AND (:internalReference IS NULL OR :internalReference = '' OR " +
            "     LOWER(d.internalReference) LIKE LOWER(CONCAT('%', :internalReference, '%'))) " +
            "AND (:subsidiaryDebtorId IS NULL OR d.subsidiaryDebtorId = :subsidiaryDebtorId) " +
            "AND (:subsidiaryCreditorId IS NULL OR d.subsidiaryCreditorId = :subsidiaryCreditorId) " +
            "AND (:counterpartCreditorId IS NULL OR d.counterpartCreditorId = :counterpartCreditorId) " +
            "AND (:loanTypeId IS NULL OR d.loanTypeId = :loanTypeId) " +
            "AND (:periodsId IS NULL OR d.periodsId = :periodsId) " +
            "AND (:rateClassificationId IS NULL OR d.rateClassificationId = :rateClassificationId) " +
            "AND (:basisId IS NULL OR d.basisId = :basisId) " +
            "AND (:amortizationMethodId IS NULL OR d.amortizationMethodId = :amortizationMethodId) " +
            "AND (:roundingTypeId IS NULL OR d.roundingTypeId = :roundingTypeId) " +
            "AND (:interestStructureId IS NULL OR d.interestStructureId = :interestStructureId) " +
            "AND (:validityStartDateFrom IS NULL OR d.validityStartDate >= :validityStartDateFrom) " +
            "AND (:validityStartDateTo IS NULL OR d.validityStartDate <= :validityStartDateTo) " +
            "AND (:disbursementDateFrom IS NULL OR d.disbursementDate >= :disbursementDateFrom) " +
            "AND (:disbursementDateTo IS NULL OR d.disbursementDate <= :disbursementDateTo) " +
            "AND (:interestStartDateFrom IS NULL OR d.interestStartDate >= :interestStartDateFrom) " +
            "AND (:interestStartDateTo IS NULL OR d.interestStartDate <= :interestStartDateTo) " +
            "AND (:maturityDateFrom IS NULL OR d.maturityDate >= :maturityDateFrom) " +
            "AND (:maturityDateTo IS NULL OR d.maturityDate <= :maturityDateTo) " +
            "AND (:nominalMin IS NULL OR d.nominal >= :nominalMin) " +
            "AND (:nominalMax IS NULL OR d.nominal <= :nominalMax) " +
            "AND (:amortizationRateMin IS NULL OR d.amortizationRate >= :amortizationRateMin) " +
            "AND (:amortizationRateMax IS NULL OR d.amortizationRate <= :amortizationRateMax) " +
            "AND (:operationTrmMin IS NULL OR d.operationTrm >= :operationTrmMin) " +
            "AND (:operationTrmMax IS NULL OR d.operationTrm <= :operationTrmMax) " +
            "AND (:termSofrAdjMin IS NULL OR d.termSofrAdj >= :termSofrAdjMin) " +
            "AND (:termSofrAdjMax IS NULL OR d.termSofrAdj <= :termSofrAdjMax) " +
            "AND (:applicableMarginMin IS NULL OR d.applicableMargin >= :applicableMarginMin) " +
            "AND (:applicableMarginMax IS NULL OR d.applicableMargin <= :applicableMarginMax) " +
            "AND (:applyAmortizationException IS NULL OR d.applyAmortizationException = :applyAmortizationException) " +
            "AND (:status IS NULL OR d.status = :status) " +
            "AND (:registeredBy IS NULL OR :registeredBy = '' OR " +
            "     LOWER(d.registeredBy) LIKE LOWER(CONCAT('%', :registeredBy, '%'))) " +
            "AND (:registrationDateFrom IS NULL OR d.registrationDate >= :registrationDateFrom) " +
            "AND (:registrationDateTo IS NULL OR d.registrationDate <= :registrationDateTo)")
    Page<DebtRegistry> searchDebts(
            @Param("searchText") String searchText,
            @Param("productClassId") String productClassId,
            @Param("productTypeId") String productTypeId,
            @Param("currencyId") String currencyId,
            @Param("rateTypeId") String rateTypeId,
            @Param("referenceRate") String referenceRate,
            @Param("portfolio") String portfolio,
            @Param("project") String project,
            @Param("assignment") String assignment,
            @Param("internalReference") String internalReference,
            @Param("subsidiaryDebtorId") Integer subsidiaryDebtorId,
            @Param("subsidiaryCreditorId") Integer subsidiaryCreditorId,
            @Param("counterpartCreditorId") Integer counterpartCreditorId,
            @Param("loanTypeId") Integer loanTypeId,
            @Param("periodsId") Integer periodsId,
            @Param("rateClassificationId") Integer rateClassificationId,
            @Param("basisId") Integer basisId,
            @Param("amortizationMethodId") Integer amortizationMethodId,
            @Param("roundingTypeId") Integer roundingTypeId,
            @Param("interestStructureId") Integer interestStructureId,
            @Param("validityStartDateFrom") Integer validityStartDateFrom,
            @Param("validityStartDateTo") Integer validityStartDateTo,
            @Param("disbursementDateFrom") Integer disbursementDateFrom,
            @Param("disbursementDateTo") Integer disbursementDateTo,
            @Param("interestStartDateFrom") Integer interestStartDateFrom,
            @Param("interestStartDateTo") Integer interestStartDateTo,
            @Param("maturityDateFrom") Integer maturityDateFrom,
            @Param("maturityDateTo") Integer maturityDateTo,
            @Param("nominalMin") BigDecimal nominalMin,
            @Param("nominalMax") BigDecimal nominalMax,
            @Param("amortizationRateMin") BigDecimal amortizationRateMin,
            @Param("amortizationRateMax") BigDecimal amortizationRateMax,
            @Param("operationTrmMin") BigDecimal operationTrmMin,
            @Param("operationTrmMax") BigDecimal operationTrmMax,
            @Param("termSofrAdjMin") BigDecimal termSofrAdjMin,
            @Param("termSofrAdjMax") BigDecimal termSofrAdjMax,
            @Param("applicableMarginMin") BigDecimal applicableMarginMin,
            @Param("applicableMarginMax") BigDecimal applicableMarginMax,
            @Param("applyAmortizationException") Boolean applyAmortizationException,
            @Param("status") Boolean status,
            @Param("registeredBy") String registeredBy,
            @Param("registrationDateFrom") LocalDateTime registrationDateFrom,
            @Param("registrationDateTo") LocalDateTime registrationDateTo,
            Pageable pageable);
}
