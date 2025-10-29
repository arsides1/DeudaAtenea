package com.alicorp.zeusBack.Postgres.model.Deuda;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "t554_payment_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "t554_id")
    private Integer id;

    @NotBlank
    @Column(name = "t554_code", length = 20, unique = true, nullable = false)
    private String code;

    @NotBlank
    @Column(name = "t554_description", length = 100, nullable = false)
    private String description;

    @Column(name = "t554_abbreviation", length = 10)
    private String abbreviation;

    @NotNull
    @Column(name = "t554_status", nullable = false)
    private Boolean status = true;

    @NotBlank
    @Column(name = "t554_registered_by", length = 25, nullable = false)
    private String registeredBy;

    @Column(name = "t554_registration_date")
    private LocalDateTime registrationDate;

    @NotNull
    @Column(name = "t554_order", nullable = false)
    private Integer order;

    @PrePersist
    protected void onCreate() {
        if (registrationDate == null) {
            registrationDate = LocalDateTime.now();
        }
        if (status == null) {
            status = true;
        }
    }

    public boolean isNormal() {
        return "NORMAL".equals(code);
    }

    public boolean isPartialPrepayment() {
        return "PREPAGO_PARCIAL".equals(code);
    }

    public boolean isTotalPrepayment() {
        return "PREPAGO_TOTAL".equals(code);
    }

    public boolean isPrepayment() {
        return isPartialPrepayment() || isTotalPrepayment();
    }
}