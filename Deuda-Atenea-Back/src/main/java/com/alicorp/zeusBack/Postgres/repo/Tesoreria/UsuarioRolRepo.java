package com.alicorp.zeusBack.Postgres.repo.Tesoreria;

import com.alicorp.zeusBack.Postgres.model.Tesoreria.UsuarioRol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UsuarioRolRepo extends JpaRepository<UsuarioRol, Integer> {
    @Query(value = "select * from f010_obtener_usuarios_por_roles(:roles)",nativeQuery = true)
    List<UsuarioRol> listaUsuariosPorRoles(@Param("roles")List<String> roles);
}
