package com.alicorp.zeusBack.Postgres.model.Tesoreria;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name="t486_modification_history", schema="public")
public class ModificationHistory {
    @Column(name = "t486_id")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer t486_id;
    @Column(name = "t486_id_process")
    private Integer t486_id_process;
    @Column(name = "t486_table_name")
    private String t486_table_name;
    @Column(name = "t486_table_register_id")
    private String t486_table_register_id;
    @Column(name = "t486_column_name")
    private String t486_column_name;
    @Column(name = "t486_previous_value")
    private String t486_previous_value;
    @Column(name = "t486_new_value")
    private String t486_new_value;
    @Column(name = "t486_registered_by")
    private String t486_registered_by;
    @Column(name = "t486_register_date")
    private LocalDateTime t486_register_date;
}
