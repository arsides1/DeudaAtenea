package com.alicorp.zeusBack.Postgres.model.Deuda;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "t465_factores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Factor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "t465_id")
    private Integer id;

    @Column(name = "t465_factor", length = 250)
    private String factor;

    @Column(name = "t465_indicador", length = 250)
    private String indicador;

    @Column(name = "t465_moneda_1", length = 250)
    private String moneda1;

    @Column(name = "t465_moneda_2", length = 250)
    private String moneda2;

    @Column(name = "t465_pais", length = 250)
    private String pais;

    @Column(name = "t465_plazo")
    private Double plazo;

    @Column(name = "t465_ticket", length = 250)
    private String ticket;

    @Column(name = "t465_fecha", length = 250)
    private String fecha;

    @Column(name = "t465_spot")
    private Double spot;

    @Column(name = "t465_file_name", length = 250)
    private String fileName;

    @Column(name = "t465_status")
    private Boolean status;
}
