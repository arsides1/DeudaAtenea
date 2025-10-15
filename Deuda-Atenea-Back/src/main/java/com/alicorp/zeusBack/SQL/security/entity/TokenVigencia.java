package com.alicorp.zeusBack.SQL.security.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.tomcat.jni.Local;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity(name = "token_vigencia")
public class TokenVigencia {
    @Column(name = "id")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "usuario_id")
    private Integer usuario_id;
    @Column(name = "token")
    private String token;
    @Column(name = "fecha_creacion")
    private LocalDateTime fecha_creacion;
    //private LocalDateTime fecha_creacion;
    @Column(name = "fecha_expiracion")
    private LocalDateTime fecha_expiracion;
    @Column(name = "status")
    private Boolean status;
}
