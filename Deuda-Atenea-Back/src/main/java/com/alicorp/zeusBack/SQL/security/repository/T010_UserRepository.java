package com.alicorp.zeusBack.SQL.security.repository;

import com.alicorp.zeusBack.SQL.security.entity.T010_User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface T010_UserRepository extends JpaRepository<T010_User, String> {
}
