package com.alicorp.zeusBack.Postgres.repo.Deuda;

import com.alicorp.zeusBack.Postgres.model.Deuda.ProductName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductNameRepository extends JpaRepository<ProductName, Integer> {

    /**
     * Buscar un nombre de producto por descripción y tipo de producto
     */
    @Query("SELECT p FROM ProductName p WHERE LOWER(p.description) = LOWER(:description) " +
            "AND p.productTypeId = :productTypeId AND p.status = true")
    ProductName findByDescriptionAndProductTypeId(@Param("description") String description,
                                                  @Param("productTypeId") Integer productTypeId);

    /**
     * Buscar todos los nombres de producto por tipo de producto
     */
    List<ProductName> findByProductTypeIdAndStatusTrue(Integer productTypeId);

    /**
     * Buscar por código
     */
    ProductName findByCodeAndStatusTrue(String code);
}























