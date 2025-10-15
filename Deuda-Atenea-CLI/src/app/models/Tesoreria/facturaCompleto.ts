import { Basis } from "./basis";
import { Subsidiaria } from "./subsidiaria";

export class FacturaCompleto {
    t454_id: string; //código
    t454_registered_by: string;
    t454_registration_date: number;
    t454_record_type: string;//ATENEA
    t454_document_date: number;//fecha de comprobante
    t454_id_type_co: string;//FACT
    t454_id_subsidiary: number;//por definir como obtener el id (si no existe, mostrar mensaje: No existe... por favor registrar)
    t454_id_provider: number;//16
    t454_id_coverage_type: number;//1
    t454_id_risk_type: number;//0
    t454_id_underlying: number;//materia prima
    t454_id_shipment: number;//barco
    t454_id_currency: string;//moneda (si no existe, mostrar mensaje: No existe... por favor registrar)
    t454_id_basis: number;//0
    t454_id_periods: number;//0
    t454_nominal: number;//monto nominal (monto original con decimales)
    t454_nominal_usd: number;//usd ? monto nominal : convertir (aun no se puede convertir, se hará luego)
    t454_nominal_paid_usd: number;//0
    t454_residue_usd: number;//t454_nominal_usd
    t454_id_treasury_state: number;//1
    t454_grouper: string;//''
    t454_contract: string;//''
    t454_contract_type: string;//''
    t454_ticker: string;//''
    t454_future: string;//''
    t454_volume: number;//0
    t454_num_contracts: number;//0
    t454_future_price: number;//0
    t454_upload_start_date: number;//fecha hoy
    t454_upload_end_date: number;//fecha hoy
    t454_start_date: number;//fecha de comprobante yyyymmdd
    t454_end_date: number;//fecha vencimiento
    t454_settlement_date: number;//fecha vencimiento
    t454_term: number;//t454_end_date - t454_start_date
    t454_id_rate_type: string;//''
    t454_rate: number;//0
    t454_id_subsidiary_debtor: number;
    t454_id_subsidiary_creditor: number;
    t454_id_counterpart_creditor: number;
    t454_placement_date: number;
    subsidiariaDeudor: Subsidiaria;
    subsidiariaAcreedor: Subsidiaria;
    basis: Basis;
}
