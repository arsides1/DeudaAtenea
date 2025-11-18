package com.alicorp.zeusBack.Postgres.repo.Deuda;



import com.alicorp.zeusBack.Postgres.model.Deuda.Factor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FactorRepository extends JpaRepository<Factor, Integer> {

    @Query(value = """
    SELECT a.t465_spot 
    FROM public.t465_factores a
    INNER JOIN public.t470_factor_config b ON a.t465_ticket = b.t470_ticket
    WHERE a.t465_fecha = :fecha
        AND b.t470_indicator = 'SOFR'
        AND b.t470_factor_type = 'TASA_INTERES'
        AND a.t465_status = true
        AND b.t470_status = true
    LIMIT 1
    """, nativeQuery = true)
    Double findSofrRateByDate(@Param("fecha") String fecha);
}
