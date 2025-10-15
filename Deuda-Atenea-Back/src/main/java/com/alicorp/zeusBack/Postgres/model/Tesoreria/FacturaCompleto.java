package com.alicorp.zeusBack.Postgres.model.Tesoreria;

import com.alicorp.zeusBack.SQL.security.entity.Usuario;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name="t454_coverage_objects", schema="public")
public class FacturaCompleto {
    @Column
    @Id
    private String t454_id; //código
    @Column
    private String t454_registered_by;
    @Column
    private Integer t454_registration_date;
    @Column
    private String t454_record_type;//ATENEA
    @Column
    private Integer t454_document_date;//fecha de comprobante
    @Column
    private String t454_id_type_co;//FACT
    @Column
    private Integer t454_id_subsidiary;//por definir como obtener el id (si no existe, mostrar mensaje: No existe... por favor registrar)
    @Column
    private Integer t454_id_provider;//16
    @Column
    private Integer t454_id_coverage_type;//1
    @Column
    private Integer t454_id_risk_type;//0
    @Column
    private Integer t454_id_underlying;//materia prima
    @Column
    private Integer t454_id_shipment;//barco
    @Column
    private String t454_id_currency;//moneda (si no existe, mostrar mensaje: No existe... por favor registrar)
    @Column
    private Integer t454_id_basis;//0
    @Column
    private Integer t454_id_periods;//0
    @Column
    private BigDecimal t454_nominal;//monto nominal (monto original con decimales)
    @Column
    private BigDecimal t454_nominal_usd;//usd ? monto nominal : convertir (aun no se puede convertir, se hará luego)
    @Column
    private BigDecimal t454_nominal_paid_usd;//0
    @Column
    private BigDecimal t454_residue_usd;//t454_nominal_usd
    @Column
    private Integer t454_id_treasury_state;//1
    @Column
    private String t454_grouper;//''
    @Column
    private String t454_contract;//''
    @Column
    private String t454_contract_type;//''
    @Column
    private String t454_ticker;//''
    @Column
    private String t454_future;//''
    @Column
    private BigDecimal t454_volume;//0
    @Column
    private BigDecimal t454_num_contracts;//0
    @Column
    private BigDecimal t454_future_price;//0
    @Column
    private Integer t454_upload_start_date;//fecha hoy
    @Column
    private Integer t454_upload_end_date;//fecha hoy
    @Column
    private Integer t454_start_date;//fecha de comprobante yyyymmdd
    @Column
    private Integer t454_end_date;//fecha vencimiento
    @Column
    private Integer t454_settlement_date;//fecha vencimiento
    @Column
    private Integer t454_term;//t454_end_date - t454_start_date
    @Column
    private String t454_id_rate_type;//''
    @Column
    private BigDecimal t454_rate;//0
    @Column
    private Integer t454_id_subsidiary_debtor;
    @Column
    private Integer t454_id_subsidiary_creditor;
    @Column
    private Integer t454_id_counterpart_creditor;
    @Column
    private Integer t454_placement_date;

    @OneToOne
    @JoinColumn(name = "t454_id_subsidiary_debtor", insertable = false, updatable = false)  // Indicar que no se debe insertar ni actualizar
    private Subsidiaria subsidiariaDeudor;

    @OneToOne
    @JoinColumn(name = "t454_id_subsidiary_creditor", insertable = false, updatable = false)  // Indicar que no se debe insertar ni actualizar
    private Subsidiaria subsidiariaAcreedor;

    @OneToOne
    @JoinColumn(name = "t454_id_basis", insertable = false, updatable = false)  // Indicar que no se debe insertar ni actualizar
    private Basis basis;
}
