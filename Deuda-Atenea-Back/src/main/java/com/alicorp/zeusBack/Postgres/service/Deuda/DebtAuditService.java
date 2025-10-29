package com.alicorp.zeusBack.Postgres.service.Deuda;

import com.alicorp.zeusBack.Postgres.model.Tesoreria.ModificationHistory;
import com.alicorp.zeusBack.Postgres.repo.Tesoreria.ModificationHistoryRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DebtAuditService {

    private final ModificationHistoryRepo modificationHistoryRepo;

    private static final Integer PROCESO_REGISTRO_DEUDA = 100; // ID del proceso para registro de deuda
    private static final Integer PROCESO_ACTUALIZACION_DEUDA = 101; // ID del proceso para actualización
    private static final Integer PROCESO_ELIMINACION_DEUDA = 102; // ID del proceso para eliminación

    /**
     * Registrar auditoría para creación de deuda
     */
    @Transactional
    public void auditarCreacionDeuda(String debtId, Object request, String usuario) {
        List<ModificationHistory> auditorias = new ArrayList<>();

        try {
            Field[] fields = request.getClass().getDeclaredFields();

            for (Field field : fields) {
                field.setAccessible(true);
                Object value = field.get(request);

                if (value != null) {
                    ModificationHistory audit = new ModificationHistory();
                    audit.setT486_id_process(PROCESO_REGISTRO_DEUDA);
                    audit.setT486_table_name("t532_debt_registry");
                    audit.setT486_table_register_id(debtId);
                    audit.setT486_column_name(field.getName());
                    audit.setT486_previous_value(null);
                    audit.setT486_new_value(value.toString());
                    audit.setT486_registered_by(usuario);
                    audit.setT486_register_date(obtenerFechaHoraActual());

                    auditorias.add(audit);
                }
            }

            if (!auditorias.isEmpty()) {
                modificationHistoryRepo.saveAll(auditorias);
                log.info("Auditoría registrada para creación de deuda: {} con {} campos", debtId, auditorias.size());
            }

        } catch (Exception e) {
            log.error("Error al registrar auditoría de creación: ", e);
        }
    }

    /**
     * Registrar auditoría para actualización de deuda
     */
    @Transactional
    public void auditarActualizacionDeuda(String debtId, Object valorAnterior, Object valorNuevo, String usuario) {
        List<ModificationHistory> auditorias = new ArrayList<>();

        try {
            Field[] fields = valorNuevo.getClass().getDeclaredFields();

            for (Field field : fields) {
                field.setAccessible(true);
                Object newValue = field.get(valorNuevo);
                Object oldValue = field.get(valorAnterior);

                // Solo registrar si hay cambio
                if (hayCambio(oldValue, newValue)) {
                    ModificationHistory audit = new ModificationHistory();
                    audit.setT486_id_process(PROCESO_ACTUALIZACION_DEUDA);
                    audit.setT486_table_name("t532_debt_registry");
                    audit.setT486_table_register_id(debtId);
                    audit.setT486_column_name(field.getName());
                    audit.setT486_previous_value(oldValue != null ? oldValue.toString() : null);
                    audit.setT486_new_value(newValue != null ? newValue.toString() : null);
                    audit.setT486_registered_by(usuario);
                    audit.setT486_register_date(obtenerFechaHoraActual());

                    auditorias.add(audit);
                }
            }

            if (!auditorias.isEmpty()) {
                modificationHistoryRepo.saveAll(auditorias);
                log.info("Auditoría registrada para actualización de deuda: {} con {} cambios", debtId, auditorias.size());
            }

        } catch (Exception e) {
            log.error("Error al registrar auditoría de actualización: ", e);
        }
    }

    /**
     * Registrar auditoría para eliminación lógica
     */
    @Transactional
    public void auditarEliminacionDeuda(String debtId, String usuario) {
        ModificationHistory audit = new ModificationHistory();
        audit.setT486_id_process(PROCESO_ELIMINACION_DEUDA);
        audit.setT486_table_name("t532_debt_registry");
        audit.setT486_table_register_id(debtId);
        audit.setT486_column_name("t532_status");
        audit.setT486_previous_value("true");
        audit.setT486_new_value("false");
        audit.setT486_registered_by(usuario);
        audit.setT486_register_date(obtenerFechaHoraActual());

        modificationHistoryRepo.save(audit);
        log.info("Auditoría registrada para eliminación lógica de deuda: {}", debtId);
    }

    /**
     * Registrar cambios en cronograma
     */
    @Transactional
    public void auditarCambiosCronograma(String debtId, String tipoOperacion, Integer cantidadRegistros, String usuario) {
        ModificationHistory audit = new ModificationHistory();
        audit.setT486_id_process(PROCESO_ACTUALIZACION_DEUDA);
        audit.setT486_table_name("t533_debt_schedule");
        audit.setT486_table_register_id(debtId);
        audit.setT486_column_name("cronograma_completo");
        audit.setT486_previous_value(tipoOperacion.equals("CREATE") ? null : "cronograma_anterior");
        audit.setT486_new_value(tipoOperacion + " - " + cantidadRegistros + " registros");
        audit.setT486_registered_by(usuario);
        audit.setT486_register_date(obtenerFechaHoraActual());

        modificationHistoryRepo.save(audit);
        log.info("Auditoría registrada para cambios en cronograma de deuda: {}", debtId);
    }

    /**
     * Verificar si hay cambio entre dos valores
     */
    private boolean hayCambio(Object oldValue, Object newValue) {
        if (oldValue == null && newValue == null) {
            return false;
        }
        if (oldValue == null || newValue == null) {
            return true;
        }
        return !oldValue.equals(newValue);
    }

    /**
     * Obtener fecha y hora actual en zona horaria de Lima
     */
    private LocalDateTime obtenerFechaHoraActual() {
        ZoneId zoneId = ZoneId.of("America/Lima");
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        return now.toLocalDateTime();
    }
}