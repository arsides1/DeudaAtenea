package com.alicorp.zeusBack.SQL.security.repository;

import com.alicorp.zeusBack.SQL.security.entity.PasswordHistorico;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordHistoricoRepository extends JpaRepository<PasswordHistorico, Integer> {
}
