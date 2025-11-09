package com.alicorp.zeusBack.Postgres.service.Deuda;

import com.alicorp.zeusBack.Postgres.model.Deuda.*;
import com.alicorp.zeusBack.Postgres.model.Deuda.dto.*;
import com.alicorp.zeusBack.Postgres.repo.Deuda.DebtRegistryRepository;
import com.alicorp.zeusBack.Postgres.repo.Deuda.AmortizationRateExceptionRepository;
import com.alicorp.zeusBack.Postgres.repo.Deuda.DebtScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.*;
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
    private final ProductNameService productNameService;
    private final DebtAuditService auditService;


    /**
     * Guardar nueva deuda - Solo registra lo que viene del frontend
     */
    @Transactional
    public DebtRegistry saveDebtRegistry(DebtRegistryRequest request) {
        String debtId = generateDebtId();
        DebtRegistry debtRegistry = new DebtRegistry();
        debtRegistry.setId(debtId);

        // Manejar nombre de producto
        if (request.getProductName() != null && !request.getProductName().trim().isEmpty()
                && request.getProductTypeId() != null) {
            Integer productNameId = productNameService.findOrCreateProductName(
                    request.getProductName().trim(),
                    request.getProductTypeId()
            );
            request.setProductNameId(productNameId);
        }

        // Mapear todos los campos de la cabecera
        mapRequestToEntity(request, debtRegistry);

        // Guardar la deuda principal
        debtRegistry = debtRegistryRepository.save(debtRegistry);

        // AUDITORÍA - Registrar creación
        auditService.auditarCreacionDeuda(debtId, request, request.getRegisteredBy());

        // Si hay excepciones de amortización, guardarlas
        if (Boolean.TRUE.equals(request.getApplyAmortizationException()) &&
                request.getAmortizationExceptions() != null &&
                !request.getAmortizationExceptions().isEmpty()) {
            saveAmortizationExceptions(debtId, request.getAmortizationExceptions(), request.getRegisteredBy());
        }

        // Guardar cronograma tal como viene del frontend
        if (request.getSchedules() != null && !request.getSchedules().isEmpty()) {
            saveSchedules(debtId, request.getSchedules(), request.getRegisteredBy());
            // AUDITORÍA - Registrar creación de cronograma
            auditService.auditarCambiosCronograma(debtId, "CREATE", request.getSchedules().size(), request.getRegisteredBy());
        }

        return debtRegistry;
    }

    /**
     * Actualizar deuda existente
     */
    @Transactional
    public DebtRegistry updateDebtRegistry(String id, DebtRegistryRequest request) {
        DebtRegistry debtRegistryOriginal = debtRegistryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Deuda no encontrada con ID: " + id));

        // Crear copia del estado anterior para auditoría
        DebtRegistry debtRegistryAnterior = new DebtRegistry();
        BeanUtils.copyProperties(debtRegistryOriginal, debtRegistryAnterior);

        // Manejar nombre de producto en actualización
        if (request.getProductName() != null && !request.getProductName().trim().isEmpty()
                && request.getProductTypeId() != null) {
            Integer productNameId = productNameService.findOrCreateProductName(
                    request.getProductName().trim(),
                    request.getProductTypeId()
            );
            request.setProductNameId(productNameId);
        }

        // Actualizar campos
        mapRequestToEntity(request, debtRegistryOriginal);

        // Guardar cambios
        DebtRegistry debtRegistryActualizada = debtRegistryRepository.save(debtRegistryOriginal);

        // AUDITORÍA - Registrar actualización
        auditService.auditarActualizacionDeuda(id, debtRegistryAnterior, debtRegistryActualizada, request.getRegisteredBy());

        // Actualizar excepciones de amortización
        updateAmortizationExceptions(id, request);

        // Actualizar cronograma
        boolean cronogramaActualizado = updateSchedules(id, request);
        if (cronogramaActualizado && request.getSchedules() != null && !request.getSchedules().isEmpty()) {
            // AUDITORÍA - Registrar actualización de cronograma
            auditService.auditarCambiosCronograma(id, "UPDATE", request.getSchedules().size(), request.getRegisteredBy());
        }

        return debtRegistryActualizada;
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
   /* @Transactional
   public void deleteDebt(String id, String usuario) {
        DebtRegistry debt = debtRegistryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Deuda no encontrada: " + id));
        debt.setStatus(false);
        debtRegistryRepository.save(debt);

        // AUDITORÍA - Registrar eliminación lógica
        auditService.auditarEliminacionDeuda(id, usuario);
    }*/

    // ==================== MÉTODOS PRIVADOS ====================

    private void mapRequestToEntity(DebtRegistryRequest request, DebtRegistry entity) {
        // CAMPOS OBLIGATORIOS NUEVOS
        entity.setProductClassId(request.getProductClassId());
        entity.setProductTypeId(request.getProductTypeId());
        entity.setProductNameId(request.getProductNameId());

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
        entity.setRateAdjustment(request.getRateAdjustment());
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
    }

    private void saveAmortizationExceptions(String debtId, List<AmortizationExceptionRequest> exceptions, String registeredBy) {
        for (AmortizationExceptionRequest exc : exceptions) {
            AmortizationRateException exception = new AmortizationRateException();
            exception.setDebtRegistryId(debtId);
            exception.setCuotaExc(exc.getCuotaExc());
            exception.setAmortizationRate(exc.getAmortizationRate());
            exception.setResultado(exc.getResultado());
            exception.setRegisteredBy(registeredBy);
            exception.setStatus(true);
            amortizationExceptionRepository.save(exception);
        }
    }

    private void saveSchedules(String debtId, List<DebtScheduleRequest> schedules, String registeredBy) {
        int seq = 1;
        for (DebtScheduleRequest scheduleReq : schedules) {
            DebtSchedule schedule = new DebtSchedule();
            schedule.setDebtRegistryId(debtId);

            // Mapear campos del cronograma
            schedule.setPaymentNumber(scheduleReq.getPaymentNumber());
            schedule.setCalculationDate(scheduleReq.getPeriodDate());
            schedule.setPaymentDate(scheduleReq.getPaymentDate());
            schedule.setInitialBalance(scheduleReq.getNominalOpening());
            schedule.setFinalBalance(scheduleReq.getNominalClosing());
            schedule.setAmortization(scheduleReq.getAmortizationPrinc());
            schedule.setInterest(scheduleReq.getInterestPaid());
            schedule.setInterestRate(scheduleReq.getRate());
            schedule.setVariableRateDate(scheduleReq.getVariableRateDate());
            schedule.setAppliedRate(scheduleReq.getRate());
            schedule.setRateAdjustment(scheduleReq.getRateAdjustment());
            schedule.setApplicableMargin(scheduleReq.getApplicableMargin());
            schedule.setInstallment(scheduleReq.getFee());
            schedule.setFinalGuarantor(scheduleReq.getFinalGuarantor() != null ?
                    scheduleReq.getFinalGuarantor().toString() : null);

            schedule.setStatus(true);
            schedule.setRegisteredBy(registeredBy);

            debtScheduleRepository.save(schedule);
            seq++;
        }
    }

    private void updateAmortizationExceptions(String id, DebtRegistryRequest request) {
        // Eliminar excepciones existentes
        amortizationExceptionRepository.deleteByDebtRegistryId(id);

        // Agregar nuevas si aplica
        if (Boolean.TRUE.equals(request.getApplyAmortizationException()) &&
                request.getAmortizationExceptions() != null &&
                !request.getAmortizationExceptions().isEmpty()) {
            saveAmortizationExceptions(id, request.getAmortizationExceptions(), request.getRegisteredBy());
        }
    }

    private boolean updateSchedules(String id, DebtRegistryRequest request) {
        // Verificar si hay cronograma para actualizar
        if (request.getSchedules() == null || request.getSchedules().isEmpty()) {
            return false;
        }

        // Eliminar cronograma existente
        debtScheduleRepository.deleteByDebtRegistryId(id);

        // Agregar nuevo cronograma
        saveSchedules(id, request.getSchedules(), request.getRegisteredBy());
        return true;
    }

    private DebtSummaryDTO convertToSummaryDTO(DebtRegistry debt) {
        DebtSummaryDTO dto = new DebtSummaryDTO();

        // Mapear campos básicos
        dto.setId(debt.getId());
        dto.setProductClassId(debt.getProductClassId());
        dto.setProductTypeId(debt.getProductTypeId());
        dto.setSubsidiaryDebtorId(debt.getSubsidiaryDebtorId());
        dto.setCreditorType(debt.getCreditorType());
        dto.setSubsidiaryCreditorId(debt.getSubsidiaryCreditorId());
        dto.setCounterpartCreditorId(debt.getCounterpartCreditorId());
        dto.setValidityStartDate(debt.getValidityStartDate());
        dto.setDisbursementDate(debt.getDisbursementDate());
        dto.setMaturityDate(debt.getMaturityDate());
        dto.setCurrencyId(debt.getCurrencyId());
        dto.setNominal(debt.getNominal());
        dto.setAmortizationRate(debt.getAmortizationRate());
        dto.setAmortizationStartPayment(debt.getAmortizationStartPayment());
        dto.setPeriodsId(debt.getPeriodsId());
        dto.setRateClassificationId(debt.getRateClassificationId());
        dto.setFixedRatePercentage(debt.getFixedRatePercentage());
        dto.setReferenceRate(debt.getReferenceRate());
        dto.setRateAdjustment(debt.getRateAdjustment());
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
        dto.setProductClassId(debt.getProductClassId());
        dto.setProductTypeId(debt.getProductTypeId());
        dto.setSubsidiaryDebtorId(debt.getSubsidiaryDebtorId());
        dto.setCreditorType(debt.getCreditorType());
        dto.setSubsidiaryCreditorId(debt.getSubsidiaryCreditorId());
        dto.setCounterpartCreditorId(debt.getCounterpartCreditorId());
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
        dto.setRateAdjustment(debt.getRateAdjustment());
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

        // ========== CAMBIO: Usar debtState (String) en lugar de status (Boolean) ==========
        // Si no se especifica debtState, buscar solo ACTIVAS
        String debtStateFilter = searchRequest.getDebtState();
        if (debtStateFilter == null || debtStateFilter.isEmpty()) {
            debtStateFilter = "ACTIVO";  // Por defecto solo deudas activas
        }
        // ========== FIN CAMBIO ==========

        // Ejecutar búsqueda en el repository
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
                searchRequest.getProductNameId(),
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
                searchRequest.getRateAdjustmentMin(),
                searchRequest.getRateAdjustmentMax(),
                searchRequest.getApplicableMarginMin(),
                searchRequest.getApplicableMarginMax(),
                searchRequest.getRegisteredBy(),
                searchRequest.getRegistrationDateFrom(),
                searchRequest.getRegistrationDateTo(),
                pageable
        );

        // ========== CAMBIO: Filtrar por debtState (String) en lugar de status (Boolean) ==========
        final String finalDebtStateFilter = debtStateFilter;
        final Boolean exceptionFilter = searchRequest.getApplyAmortizationException();

        List<DebtRegistry> filteredList = debts.getContent().stream()
                .filter(debt -> {
                    // Filtro por debtState (ACTIVO, INACTIVO, PAGADO)
                    boolean stateMatch = (finalDebtStateFilter == null) ||
                            (debt.getDebtState() != null && debt.getDebtState().equals(finalDebtStateFilter));

                    // Filtro por applyAmortizationException
                    boolean exceptionMatch = (exceptionFilter == null) ||
                            (debt.getApplyAmortizationException() != null &&
                                    debt.getApplyAmortizationException().equals(exceptionFilter));

                    return stateMatch && exceptionMatch;
                })
                .collect(Collectors.toList());
        // ========== FIN CAMBIO ==========

        // Crear nueva Page con resultados filtrados
        Page<DebtRegistry> filteredDebts = new PageImpl<>(
                filteredList,
                pageable,
                filteredList.size()
        );

        // Convertir a DTOs
        return filteredDebts.map(this::convertToSummaryDTO);
    }
    private String generateDebtId() {
        return "DEBT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    @Transactional
    public void eliminarDeuda(String debtId) {
        DebtRegistry debt = debtRegistryRepository.findById(debtId)
                .orElseThrow(() -> new RuntimeException("Deuda no encontrada: " + debtId));

        debt.setDebtState("INACTIVO");
        debtRegistryRepository.save(debt);
    }
}