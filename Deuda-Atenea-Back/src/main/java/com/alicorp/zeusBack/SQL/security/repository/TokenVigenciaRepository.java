package com.alicorp.zeusBack.SQL.security.repository;

import com.alicorp.zeusBack.SQL.security.entity.TokenVigencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

public interface TokenVigenciaRepository extends JpaRepository<TokenVigencia, Integer> {
    @Modifying
    @Transactional
    @Query(value = "{call S220_EnvioCorreoXProceso(:Cod_Proceso, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, :IdUsuario, NULL, NULL, NULL, NULL, :Token)}",nativeQuery = true)
    void enviarCorreo(@Param("Cod_Proceso") Integer Cod_Proceso,
                                 @Param("IdUsuario") Integer IdUsuario,
                                 @Param("Token") String Token);
}
