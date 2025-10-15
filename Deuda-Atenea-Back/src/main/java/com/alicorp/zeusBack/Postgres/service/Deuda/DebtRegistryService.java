package com.alicorp.zeusBack.Postgres.service.Deuda;

import com.alicorp.zeusBack.Postgres.model.Deuda.*;
import com.alicorp.zeusBack.Postgres.model.Deuda.dto.*;
import com.alicorp.zeusBack.Postgres.repo.Deuda.DebtRegistryRepository;
import com.alicorp.zeusBack.Postgres.repo.Deuda.AmortizationRateExceptionRepository;
import com.alicorp.zeusBack.Postgres.repo.Deuda.DebtScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DebtRegistryService {

    private final DebtRegistryRepository debtRegistryRepository;
    private final AmortizationRateExceptionRepository amortizationExceptionRepository;
    private final DebtScheduleRepository debtScheduleRepository;

    /**
     * Guardar nueva deuda - Solo registra lo que viene del frontend
     */
    @Transactional
    public DebtRegistry saveDebtRegistry(DebtRegistryRequest request) {
        String debtId = generateDebtId();
        DebtRegistry debtRegistry = new DebtRegistry();
        debtRegistry.setId(debtId);

        // Mapear todos los campos de la cabecera
        mapRequestToEntity(request, debtRegistry);

        // Guardar la deuda principal
        debtRegistry = debtRegistryRepository.save(debtRegistry);

        // Si hay excepciones de amortización, guardarlas
        if (Boolean.TRUE.equals(request.getApplyAmortizationException()) &&
                request.getAmortizationExceptions() != null &&
                !request.getAmortizationExceptions().isEmpty()) {
            saveAmortizationExceptions(debtId, request.getAmortizationExceptions(), request.getRegisteredBy());
        }

        // Guardar cronograma tal como viene del frontend
        if (request.getSchedules() != null && !request.getSchedules().isEmpty()) {
            saveSchedules(debtId, request.getSchedules(), request.getRegisteredBy());
        }

        return debtRegistry;
    }

    /**
     * Actualizar deuda existente
     */
    @Transactional
    public DebtRegistry updateDebtRegistry(String id, DebtRegistryRequest request) {
        DebtRegistry debtRegistry = debtRegistryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Deuda no encontrada con ID: " + id));

        // Actualizar campos
        mapRequestToEntity(request, debtRegistry);

        // Actualizar excepciones de amortización
        updateAmortizationExceptions(id, request);

        // Actualizar cronograma
        updateSchedules(id, request);

        return debtRegistryRepository.save(debtRegistry);
    }

    /**
     * Obtener listado de deudas activas con paginación
     */
    @Transactional(readOnly = true)
    public Page<DebtSummaryDTO> getActiveDebtsPageable(int page, int size, String sortBy, String sortDir) {
        if (size > 100) size = 100;
        if (size < 1) size = 10;
        if (page < 0) page = 0;

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ?
                Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return debtRegistryRepository.findByStatusTrueWithRelations(pageable)
                .map(this::convertToSummaryDTO);
    }

    /**
     * Obtener detalle de una deuda por ID
     */
    @Transactional(readOnly = true)
    public DebtDetailDTO getDebtById(String id) {
        // Primero cargar la deuda con sus relaciones básicas
        Optional<DebtRegistry> debtOpt = debtRegistryRepository.findByIdWithAllRelations(id);

        if (debtOpt.isPresent()) {
            DebtRegistry debt = debtOpt.get();

            // Cargar el cronograma y las excepciones de amortización
            List<DebtSchedule> schedules = debtScheduleRepository.findByDebtRegistryIdOrderByPaymentNumberAsc(id);
            List<AmortizationRateException> exceptions = new ArrayList<>();

            if (Boolean.TRUE.equals(debt.getApplyAmortizationException())) {
                exceptions = amortizationExceptionRepository.findActiveByDebtRegistryId(id);
            }

            return convertToDetailDTO(debt, schedules, exceptions);
        }
        return null;
    }

    /**
     * Eliminar deuda (borrado lógico)
     */
    @Transactional
    public void deleteDebt(String id) {
        DebtRegistry debt = debtRegistryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Deuda no encontrada: " + id));
        debt.setStatus(false);
        debtRegistryRepository.save(debt);
    }

    // ==================== MÉTODOS PRIVADOS ====================

    private void mapRequestToEntity(DebtRegistryRequest request, DebtRegistry entity) {
        // CAMPOS OBLIGATORIOS NUEVOS
        entity.setProductClassId(request.getProductClassId());
        entity.setProductTypeId(request.getProductTypeId());

        // CAMPOS OPCIONALES NUEVOS
        entity.setAmortizationStartDate(request.getAmortizationStartDate());
        entity.setRateExpressionTypeId(request.getRateExpressionTypeId());
        entity.setAmortizationTypeId(request.getAmortizationTypeId());

        // CAMPOS EXISTENTES
        entity.setSubsidiaryDebtorId(request.getSubsidiaryDebtorId());
        entity.setCreditorType(request.getCreditorType());

        if ("SUBSIDIARY".equals(request.getCreditorType())) {
            entity.setSubsidiaryCreditorId(request.getSubsidiaryCreditorId());
            entity.setCounterpartCreditorId(null);
        } else if ("COUNTERPART".equals(request.getCreditorType())) {
            entity.setSubsidiaryCreditorId(null);
            entity.setCounterpartCreditorId(request.getCounterpartCreditorId());
        }

        entity.setLoanTypeId(request.getLoanTypeId());
        entity.setValidityStartDate(request.getValidityStartDate());
        entity.setDisbursementDate(request.getDisbursementDate());
        entity.setInterestStartDate(request.getInterestStartDate());
        entity.setMaturityDate(request.getMaturityDate());
        entity.setCurrencyId(request.getCurrencyId());
        entity.setNominal(request.getNominal());
        entity.setAmortizationRate(request.getAmortizationRate());
        entity.setAmortizationStartPayment(request.getAmortizationStartPayment());
        entity.setPeriodsId(request.getPeriodsId());
        entity.setRateClassificationId(request.getRateClassificationId());
        entity.setFixedRatePercentage(request.getFixedRatePercentage());
        entity.setReferenceRate(request.getReferenceRate());
        entity.setTermSofrAdj(request.getTermSofrAdj());
        entity.setApplicableMargin(request.getApplicableMargin());
        entity.setOthers(request.getOthers());
        entity.setApplyAmortizationException(request.getApplyAmortizationException());
        entity.setOperationTrm(request.getOperationTrm());
        entity.setBasisId(request.getBasisId());
        entity.setRateTypeId(request.getRateTypeId());
        entity.setAmortizationMethodId(request.getAmortizationMethodId());
        entity.setRoundingTypeId(request.getRoundingTypeId());
        entity.setInterestStructureId(request.getInterestStructureId());
        entity.setPortfolio(request.getPortfolio());
        entity.setProject(request.getProject());
        entity.setAssignment(request.getAssignment());
        entity.setInternalReference(request.getInternalReference());
        entity.setCharacteristics(request.getCharacteristics());
        entity.setRegisteredBy(request.getRegisteredBy());
        entity.setStatus(true);
    }

    private void saveAmortizationExceptions(String debtRegistryId, List<AmortizationExceptionRequest> exceptions, String registeredBy) {
        List<AmortizationRateException> entities = exceptions.stream()
                .map(ex -> {
                    AmortizationRateException entity = new AmortizationRateException();
                    entity.setDebtRegistryId(debtRegistryId);
                    entity.setCuotaExc(ex.getCuotaExc());
                    entity.setAmortizationRate(ex.getAmortizationRate());
                    entity.setResultado(ex.getResultado());
                    entity.setRegisteredBy(registeredBy);
                    entity.setStatus(true);
                    return entity;
                })
                .collect(Collectors.toList());

        amortizationExceptionRepository.saveAll(entities);
    }

    private void updateAmortizationExceptions(String debtRegistryId, DebtRegistryRequest request) {
        // Eliminar excepciones anteriores
        amortizationExceptionRepository.deleteByDebtRegistryId(debtRegistryId);

        // Crear nuevas si aplica
        if (Boolean.TRUE.equals(request.getApplyAmortizationException()) &&
                request.getAmortizationExceptions() != null &&
                !request.getAmortizationExceptions().isEmpty()) {
            saveAmortizationExceptions(debtRegistryId, request.getAmortizationExceptions(), request.getRegisteredBy());
        }
    }

    private void saveSchedules(String debtRegistryId, List<DebtScheduleRequest> schedules, String registeredBy) {
        List<DebtSchedule> entities = schedules.stream()
                .map(schedule -> {
                    DebtSchedule entity = new DebtSchedule();
                    entity.setDebtRegistryId(debtRegistryId);
                    entity.setPaymentNumber(schedule.getPaymentNumber());
                    entity.setCalculationDate(schedule.getCalculationDate());
                    entity.setPaymentDate(schedule.getPaymentDate());
                    entity.setInitialBalance(schedule.getInitialBalance());
                    entity.setFinalBalance(schedule.getFinalBalance());
                    entity.setAmortization(schedule.getAmortization());
                    entity.setInterest(schedule.getInterest());
                    entity.setInterestRate(schedule.getInterestRate());
                    entity.setVariableRateDate(schedule.getVariableRateDate());
                    entity.setAppliedRate(schedule.getAppliedRate());
                    entity.setTermSofrAdj(schedule.getTermSofrAdj());
                    entity.setApplicableMargin(schedule.getApplicableMargin());
                    entity.setInstallment(schedule.getInstallment());
                    entity.setFinalGuarantor(schedule.getFinalGuarantor());

                    // CAMPOS NUEVOS
                    entity.setRateType(schedule.getRateType());
                    entity.setReferenceRate(schedule.getReferenceRate());
                    entity.setProvider(schedule.getProvider());
                    entity.setAcceptanceDate(schedule.getAcceptanceDate());
                    entity.setFees(schedule.getFees());
                    entity.setInsurance(schedule.getInsurance());

                    entity.setStatus(true);
                    entity.setRegisteredBy(registeredBy);
                    return entity;
                })
                .collect(Collectors.toList());

        debtScheduleRepository.saveAll(entities);
    }

    private void updateSchedules(String debtRegistryId, DebtRegistryRequest request) {
        // Eliminar cronograma anterior
        debtScheduleRepository.deleteByDebtRegistryId(debtRegistryId);

        // Crear nuevo cronograma si existe
        if (request.getSchedules() != null && !request.getSchedules().isEmpty()) {
            saveSchedules(debtRegistryId, request.getSchedules(), request.getRegisteredBy());
        }
    }

    private DebtSummaryDTO convertToSummaryDTO(DebtRegistry debt) {
        DebtSummaryDTO dto = new DebtSummaryDTO();

        // Mapeo directo de campos
        dto.setId(debt.getId());
        dto.setProductClassId(debt.getProductClassId());  // NUEVO
        dto.setProductTypeId(debt.getProductTypeId());    // NUEVO
        dto.setSubsidiaryDebtorId(debt.getSubsidiaryDebtorId());
        dto.setCreditorType(debt.getCreditorType());
        dto.setSubsidiaryCreditorId(debt.getSubsidiaryCreditorId());
        dto.setCounterpartCreditorId(debt.getCounterpartCreditorId());
        dto.setLoanTypeId(debt.getLoanTypeId());
        dto.setValidityStartDate(debt.getValidityStartDate());
        dto.setDisbursementDate(debt.getDisbursementDate());
        dto.setInterestStartDate(debt.getInterestStartDate());
        dto.setMaturityDate(debt.getMaturityDate());
        dto.setCurrencyId(debt.getCurrencyId());
        dto.setNominal(debt.getNominal());
        dto.setAmortizationRate(debt.getAmortizationRate());
        dto.setAmortizationStartPayment(debt.getAmortizationStartPayment());
        dto.setPeriodsId(debt.getPeriodsId());
        dto.setRateClassificationId(debt.getRateClassificationId());
        dto.setFixedRatePercentage(debt.getFixedRatePercentage());
        dto.setReferenceRate(debt.getReferenceRate());
        dto.setTermSofrAdj(debt.getTermSofrAdj());
        dto.setApplicableMargin(debt.getApplicableMargin());
        dto.setOthers(debt.getOthers());
        dto.setApplyAmortizationException(debt.getApplyAmortizationException());
        dto.setOperationTrm(debt.getOperationTrm());
        dto.setBasisId(debt.getBasisId());
        dto.setRateTypeId(debt.getRateTypeId());
        dto.setAmortizationMethodId(debt.getAmortizationMethodId());
        dto.setRoundingTypeId(debt.getRoundingTypeId());
        dto.setInterestStructureId(debt.getInterestStructureId());
        dto.setPortfolio(debt.getPortfolio());
        dto.setProject(debt.getProject());
        dto.setAssignment(debt.getAssignment());
        dto.setInternalReference(debt.getInternalReference());
        dto.setCharacteristics(debt.getCharacteristics());
        dto.setStatus(debt.getStatus());
        dto.setRegisteredBy(debt.getRegisteredBy());
        dto.setRegistrationDate(debt.getRegistrationDate());

        // Mapear descripciones de catálogos para mostrar en el listado
        mapDescriptions(debt, dto);

        return dto;
    }

    private DebtDetailDTO convertToDetailDTO(DebtRegistry debt, List<DebtSchedule> schedules, List<AmortizationRateException> exceptions) {
        DebtDetailDTO dto = new DebtDetailDTO();

        // Mapeo directo de todos los campos
        dto.setId(debt.getId());
        dto.setProductClassId(debt.getProductClassId());  // NUEVO
        dto.setProductTypeId(debt.getProductTypeId());    // NUEVO
        dto.setSubsidiaryDebtorId(debt.getSubsidiaryDebtorId());
        dto.setCreditorType(debt.getCreditorType());
        dto.setSubsidiaryCreditorId(debt.getSubsidiaryCreditorId());
        dto.setCounterpartCreditorId(debt.getCounterpartCreditorId());
        dto.setLoanTypeId(debt.getLoanTypeId());
        dto.setValidityStartDate(debt.getValidityStartDate());
        dto.setDisbursementDate(debt.getDisbursementDate());
        dto.setInterestStartDate(debt.getInterestStartDate());
        dto.setMaturityDate(debt.getMaturityDate());
        dto.setCurrencyId(debt.getCurrencyId());
        dto.setNominal(debt.getNominal());
        dto.setAmortizationRate(debt.getAmortizationRate());
        dto.setAmortizationStartPayment(debt.getAmortizationStartPayment());
        dto.setPeriodsId(debt.getPeriodsId());
        dto.setRateClassificationId(debt.getRateClassificationId());
        dto.setFixedRatePercentage(debt.getFixedRatePercentage());
        dto.setReferenceRate(debt.getReferenceRate());
        dto.setTermSofrAdj(debt.getTermSofrAdj());
        dto.setApplicableMargin(debt.getApplicableMargin());
        dto.setOthers(debt.getOthers());
        dto.setApplyAmortizationException(debt.getApplyAmortizationException());
        dto.setOperationTrm(debt.getOperationTrm());
        dto.setBasisId(debt.getBasisId());
        dto.setRateTypeId(debt.getRateTypeId());
        dto.setAmortizationMethodId(debt.getAmortizationMethodId());
        dto.setRoundingTypeId(debt.getRoundingTypeId());
        dto.setInterestStructureId(debt.getInterestStructureId());
        dto.setPortfolio(debt.getPortfolio());
        dto.setProject(debt.getProject());
        dto.setAssignment(debt.getAssignment());
        dto.setInternalReference(debt.getInternalReference());
        dto.setCharacteristics(debt.getCharacteristics());
        dto.setStatus(debt.getStatus());
        dto.setRegisteredBy(debt.getRegisteredBy());
        dto.setRegistrationDate(debt.getRegistrationDate());

        // Mapear descripciones
        mapDetailDescriptions(debt, dto);

        // Agregar cronograma y excepciones
        dto.setSchedules(schedules);
        dto.setAmortizationExceptions(exceptions);

        return dto;
    }

    private void mapDescriptions(DebtRegistry debt, DebtSummaryDTO dto) {
        if (debt.getSubsidiaryDebtor() != null) {
            dto.setSubsidiaryDebtorName(debt.getSubsidiaryDebtor().getT453DescriptionTreasury());
        }

        if ("SUBSIDIARY".equals(debt.getCreditorType()) && debt.getSubsidiaryCreditor() != null) {
            dto.setSubsidiaryCreditorName(debt.getSubsidiaryCreditor().getT453DescriptionTreasury());
        } else if ("COUNTERPART".equals(debt.getCreditorType()) && debt.getCounterpartCreditor() != null) {
            dto.setCounterpartCreditorName(debt.getCounterpartCreditor().getT459_description());
        }

        if (debt.getLoanType() != null) {
            dto.setLoanTypeName(debt.getLoanType().getT507Description());
        }

        if (debt.getPeriods() != null) {
            dto.setPeriodsName(debt.getPeriods().getT450Description());
        }

        if (debt.getRateClassification() != null) {
            dto.setRateClassificationName(debt.getRateClassification().getT506Description());
        }

        if (debt.getBasis() != null) {
            dto.setBasisName(debt.getBasis().getT448_description());
        }

        if (debt.getRateType() != null) {
            dto.setRateTypeName(debt.getRateType().getT449Description());
        }

        if (debt.getAmortizationMethod() != null) {
            dto.setAmortizationMethodName(debt.getAmortizationMethod().getT534Description());
        }

        if (debt.getRoundingType() != null) {
            dto.setRoundingTypeName(debt.getRoundingType().getDescription());
        }

        if (debt.getInterestStructure() != null) {
            dto.setInterestStructureName(debt.getInterestStructure().getDescription());
        }
    }

    private void mapDetailDescriptions(DebtRegistry debt, DebtDetailDTO dto) {
        // Reutilizar mapeo base
        DebtSummaryDTO summaryDto = new DebtSummaryDTO();
        mapDescriptions(debt, summaryDto);

        // Copiar descripciones
        dto.setSubsidiaryDebtorName(summaryDto.getSubsidiaryDebtorName());
        dto.setSubsidiaryCreditorName(summaryDto.getSubsidiaryCreditorName());
        dto.setCounterpartCreditorName(summaryDto.getCounterpartCreditorName());
        dto.setLoanTypeName(summaryDto.getLoanTypeName());
        dto.setPeriodsName(summaryDto.getPeriodsName());
        dto.setRateClassificationName(summaryDto.getRateClassificationName());
        dto.setBasisName(summaryDto.getBasisName());
        dto.setRateTypeName(summaryDto.getRateTypeName());
        dto.setAmortizationMethodName(summaryDto.getAmortizationMethodName());
        dto.setRoundingTypeName(summaryDto.getRoundingTypeName());
        dto.setInterestStructureName(summaryDto.getInterestStructureName());

        // Agregar descripción de moneda
        if (debt.getCurrency() != null) {
            dto.setCurrencyName(debt.getCurrency().getT064Description());
        }
    }

    /**
     * Búsqueda general de deudas con múltiples filtros
     */
    @Transactional(readOnly = true)
    public Page<DebtSummaryDTO> searchDebts(DebtSearchRequest searchRequest) {
        // Preparar paginación
        Sort.Direction direction = "ASC".equalsIgnoreCase(searchRequest.getSortDirection())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(
                searchRequest.getPage(),
                searchRequest.getSize(),
                Sort.by(direction, searchRequest.getSortBy())
        );

        // Si no se especifica status, buscar solo activos
        if (searchRequest.getStatus() == null) {
            searchRequest.setStatus(true);
        }

        // Ejecutar búsqueda
        Page<DebtRegistry> debts = debtRegistryRepository.searchDebts(
                searchRequest.getSearchText(),
                searchRequest.getProductClassId(),
                searchRequest.getProductTypeId(),
                searchRequest.getCurrencyId(),
                searchRequest.getRateTypeId(),
                searchRequest.getReferenceRate(),
                searchRequest.getPortfolio(),
                searchRequest.getProject(),
                searchRequest.getAssignment(),
                searchRequest.getInternalReference(),
                searchRequest.getSubsidiaryDebtorId(),
                searchRequest.getSubsidiaryCreditorId(),
                searchRequest.getCounterpartCreditorId(),
                searchRequest.getLoanTypeId(),
                searchRequest.getPeriodsId(),
                searchRequest.getRateClassificationId(),
                searchRequest.getBasisId(),
                searchRequest.getAmortizationMethodId(),
                searchRequest.getRoundingTypeId(),
                searchRequest.getInterestStructureId(),
                searchRequest.getValidityStartDateFrom(),
                searchRequest.getValidityStartDateTo(),
                searchRequest.getDisbursementDateFrom(),
                searchRequest.getDisbursementDateTo(),
                searchRequest.getInterestStartDateFrom(),
                searchRequest.getInterestStartDateTo(),
                searchRequest.getMaturityDateFrom(),
                searchRequest.getMaturityDateTo(),
                searchRequest.getNominalMin(),
                searchRequest.getNominalMax(),
                searchRequest.getAmortizationRateMin(),
                searchRequest.getAmortizationRateMax(),
                searchRequest.getOperationTrmMin(),
                searchRequest.getOperationTrmMax(),
                searchRequest.getTermSofrAdjMin(),
                searchRequest.getTermSofrAdjMax(),
                searchRequest.getApplicableMarginMin(),
                searchRequest.getApplicableMarginMax(),
                searchRequest.getApplyAmortizationException(),
                searchRequest.getStatus(),
                searchRequest.getRegisteredBy(),
                searchRequest.getRegistrationDateFrom(),
                searchRequest.getRegistrationDateTo(),
                pageable
        );

        // Convertir a DTOs
        return debts.map(this::convertToSummaryDTO);
    }

    private String generateDebtId() {
        return "DEBT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}