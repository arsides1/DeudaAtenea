package com.alicorp.zeusBack.SQL.security.repository;

import com.alicorp.zeusBack.SQL.security.entity.Rol;
import com.alicorp.zeusBack.SQL.security.entity.RolPorUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol,Integer> {
    @Query(value = "{call S386_ObtenerRolesPorUsuarioGestor (:nombreUsuario)}",nativeQuery = true)
    List<Rol> getRolesByUsuarioGestor(@Param("nombreUsuario") String nombreUsuario);

    Rol findByRolNombre(String rolName);
}
