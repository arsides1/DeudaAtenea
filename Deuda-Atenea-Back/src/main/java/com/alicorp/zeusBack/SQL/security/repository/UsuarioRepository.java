package com.alicorp.zeusBack.SQL.security.repository;

import com.alicorp.zeusBack.SQL.security.entity.Rol;
import com.alicorp.zeusBack.SQL.security.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario,Integer> {

    Optional<Usuario> findByNombreUsuario(String nombreUsuario);
    Optional<Usuario> findByEmail(String email);
    boolean existsByNombreUsuario(String nombreUsuario);
    boolean existsByEmail(String email);


    @Query(value = "SELECT MAX(id) FROM usuario", nativeQuery = true)
    Integer getUltimoID();

    @Modifying
    @Transactional
    @Query(value = "{call S220_EnvioCorreoXProceso(:Cod_Proceso, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, :IdUsuario, NULL, NULL, NULL, NULL, :Password)}",nativeQuery = true)
    void enviarCorreoRegistroCredenciales(@Param("Cod_Proceso") Integer Cod_Proceso,
                      @Param("IdUsuario") Integer IdUsuario,
                      @Param("Password") String Password);

    @Modifying
    @Transactional
    @Query(value = "{call S220_EnvioCorreoXProceso(:Cod_Proceso, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, :IdUsuarioNuevo, NULL, NULL, :IdUsuarioRegistrador)}",nativeQuery = true)
    void enviarCorreoRegistroNotifiacion(@Param("Cod_Proceso") Integer Cod_Proceso,
                                  @Param("IdUsuarioNuevo") Integer IdUsuarioNuevo,
                                  @Param("IdUsuarioRegistrador") Integer IdUsuarioRegistrador);

}
