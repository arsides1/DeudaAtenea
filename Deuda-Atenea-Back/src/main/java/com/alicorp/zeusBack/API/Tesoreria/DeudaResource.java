package com.alicorp.zeusBack.API.Tesoreria;

import com.alicorp.zeusBack.Postgres.model.Deuda.DebtRegistry;
import com.alicorp.zeusBack.Postgres.model.Deuda.dto.*;
import com.alicorp.zeusBack.Postgres.service.Deuda.DebtRegistryService;
import com.alicorp.zeusBack.Postgres.service.Tesoreria.DeudaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/Tesoreria/Deuda")
@CrossOrigin(origins = "*") //@CrossOrigin(origins = "http://localhost:8080")
public class DeudaResource {
    private final DeudaService deudaService;
    private final DebtRegistryService debtRegistryService;

    /**
     * Registrar nueva deuda - Solo guarda lo que viene del frontend
     */
    @PostMapping("/registrarDeuda")
    public ResponseEntity<?> registrarDeuda(@Valid @RequestBody DebtRegistryRequest request) {
        try {
            DebtRegistry savedDebt = debtRegistryService.saveDebtRegistry(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Deuda registrada exitosamente");
            response.put("id", savedDebt.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al registrar la deuda");
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Listar deudas activas con paginación
     */
    @GetMapping("/listarDeudas")
    public ResponseEntity<Page<DebtSummaryDTO>> listarDeudas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "registrationDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Page<DebtSummaryDTO> debts = debtRegistryService.getActiveDebtsPageable(page, size, sortBy, sortDir);
        return ResponseEntity.ok(debts);
    }

    /**
     * Obtener detalle de una deuda específica
     */
    @GetMapping("/obtenerDeuda/{id}")
    public ResponseEntity<?> obtenerDeuda(@PathVariable String id) {
        DebtDetailDTO debt = debtRegistryService.getDebtById(id);
        if (debt != null) {
            return ResponseEntity.ok(debt);
        }

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("message", "Deuda no encontrada");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    /**
     * Actualizar deuda existente
     */
    @PutMapping("/editarDeuda/{id}")
    public ResponseEntity<?> editarDeuda(@PathVariable String id, @Valid @RequestBody DebtRegistryRequest request) {
        try {
            DebtRegistry updatedDebt = debtRegistryService.updateDebtRegistry(id, request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Deuda actualizada exitosamente");
            response.put("id", updatedDebt.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al actualizar la deuda");
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }


    /**
     * Búsqueda general de deudas con filtros múltiples
     */
    @PostMapping("/buscarDeudas")
    public ResponseEntity<Page<DebtSummaryDTO>> buscarDeudas(
            @RequestBody DebtSearchRequest searchRequest) {
        try {
            Page<DebtSummaryDTO> debts = debtRegistryService.searchDebts(searchRequest);
            return ResponseEntity.ok(debts);
        } catch (Exception e) {
            log.error("Error en búsqueda de deudas: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Búsqueda simple por texto
     */
    @GetMapping("/buscarPorTexto")
    public ResponseEntity<Page<DebtSummaryDTO>> buscarPorTexto(
            @RequestParam(required = false) String texto,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "registrationDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        DebtSearchRequest searchRequest = new DebtSearchRequest();
        searchRequest.setSearchText(texto);
        searchRequest.setPage(page);
        searchRequest.setSize(size);
        searchRequest.setSortBy(sortBy);
        searchRequest.setSortDirection(sortDir);
        searchRequest.setDebtState("ACTIVO");

        try {
            Page<DebtSummaryDTO> debts = debtRegistryService.searchDebts(searchRequest);
            return ResponseEntity.ok(debts);
        } catch (Exception e) {
            log.error("Error en búsqueda por texto: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Búsqueda de deudas por rangos de fechas
     * <p>
     * Permite filtrar por:
     * - F. Inicio Vigencia (validityStartDate)
     * - F. Desembolso (disbursementDate)
     * - F. Vencimiento (maturityDate)
     */

    @GetMapping("/buscarPorFechas")
    public ResponseEntity<Page<DebtSummaryDTO>> buscarPorFechas(
            // F. Inicio Vigencia
            @RequestParam(required = false) Integer validityStartDateFrom,
            @RequestParam(required = false) Integer validityStartDateTo,
            // F. Desembolso
            @RequestParam(required = false) Integer disbursementDateFrom,
            @RequestParam(required = false) Integer disbursementDateTo,
            // F. Vencimiento
            @RequestParam(required = false) Integer maturityDateFrom,
            @RequestParam(required = false) Integer maturityDateTo,
            // Paginación y ordenamiento
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "registrationDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        try {
            DebtSearchRequest searchRequest = new DebtSearchRequest();
            searchRequest.setValidityStartDateFrom(validityStartDateFrom);
            searchRequest.setValidityStartDateTo(validityStartDateTo);
            searchRequest.setDisbursementDateFrom(disbursementDateFrom);
            searchRequest.setDisbursementDateTo(disbursementDateTo);
            searchRequest.setMaturityDateFrom(maturityDateFrom);
            searchRequest.setMaturityDateTo(maturityDateTo);
            searchRequest.setPage(page);
            searchRequest.setSize(size);
            searchRequest.setSortBy(sortBy);
            searchRequest.setSortDirection(sortDir);
            searchRequest.setDebtState("ACTIVO");

            Page<DebtSummaryDTO> debts = debtRegistryService.searchDebts(searchRequest);

            log.info("Búsqueda por fechas ejecutada exitosamente. Resultados: {}", debts.getTotalElements());
            return ResponseEntity.ok(debts);

        } catch (Exception e) {
            log.error("Error en búsqueda por fechas: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    @DeleteMapping("/eliminarDeuda/{id}")
    public ResponseEntity<?> eliminarDeuda(@PathVariable String id) {
        try {
            debtRegistryService.eliminarDeuda(id);
            return ResponseEntity.ok("Deuda eliminada correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
