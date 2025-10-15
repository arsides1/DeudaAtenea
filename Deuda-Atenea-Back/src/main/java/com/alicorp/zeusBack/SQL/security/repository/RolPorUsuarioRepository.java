package com.alicorp.zeusBack.SQL.security.repository;

import com.alicorp.zeusBack.SQL.security.entity.Rol;
import com.alicorp.zeusBack.SQL.security.entity.RolPorUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RolPorUsuarioRepository extends JpaRepository<RolPorUsuario, Integer> {
    @Query(value = "{call S387_ObtenerRolesPorUsuarios}",nativeQuery = true)
    List<RolPorUsuario> getRolesByUsuarios();
}
