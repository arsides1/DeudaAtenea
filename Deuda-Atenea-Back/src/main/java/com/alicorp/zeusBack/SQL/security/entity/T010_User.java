package com.alicorp.zeusBack.SQL.security.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name="T010_User", schema="dbo")
public class T010_User {
    @Column
    @Id
    private String T010_ID;
    @Column
    private Integer T010_Profile;
    @Column
    private String T010_Name;
    @Column
    private Integer T010_Status;
    @Column
    private String T010_Email;
}
