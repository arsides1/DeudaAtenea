package com.alicorp.zeusBack.Postgres.repo.Tesoreria;

import com.alicorp.zeusBack.Postgres.model.Tesoreria.FacturaCompleto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.ResultSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public interface FacturaCompletoRepo extends JpaRepository<FacturaCompleto, String> {
    @Query(value = "select * from f013_consultar_detalle_registro_prestamo(:idoc)",nativeQuery = true)
    List<Map<String, Object>> tablaCorreoRegistroPrestamo(@Param("idoc")String idoc);

    @Query(value = "select * from f014_consultar_detalle_registro_intercompany(:idoc)",nativeQuery = true)
    List<Map<String, Object>> tablaCorreoRegistroIntercompany(@Param("idoc")String idoc);

    @Query(value = "select * from f028_consultar_cuerpo_correo_registro_intercompany(:id_oc, :flg_desembolso)",nativeQuery = true)
    Map<String, String> cuerpoCorreoRegistroIntercompany(@Param("id_oc")String id_oc, @Param("flg_desembolso")Boolean flg_desembolso);
}
