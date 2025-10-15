package com.alicorp.zeusBack.SQL.security.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.WhereJoinTable;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity(name = "Usuario")
public class Usuario {
    @Id
    private  Integer id;
    private String nombre;
    private String nombreUsuario;
    private String email;
    private String password;
    private Boolean estado;
    private Integer registradoPor;
    private LocalDateTime fechaRegistro;
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name="usuario_rol", joinColumns = @JoinColumn(name = "usuario_id"),
    inverseJoinColumns = @JoinColumn(name = "rol_id"))
    private Set<Rol> roles = new HashSet<>();

    @WhereJoinTable(clause = "status=1")
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name="usuario_rol_gestor", joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "rol_gestor_id"))
    private Set<RolGestor> rolesGestor = new HashSet<>();

    @OneToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "usuario_sustento", joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "id"))
    private Set<UsuarioSustento> sustentos = new HashSet<>();

    public Usuario() {
    }

    public Usuario(Integer id, String nombre, String nombreUsuario, String email, String password, Boolean estado, Integer registradoPor, LocalDateTime fechaRegistro) {
        this.id = id;
        this.nombre = nombre;
        this.nombreUsuario = nombreUsuario;
        this.email = email;
        this.password = password;
        this.estado = estado;
        this.registradoPor = registradoPor;
        this.fechaRegistro = fechaRegistro;
    }

}
