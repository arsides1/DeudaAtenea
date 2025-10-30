export class Deuda {
    idDeudorSeleccionado: number | null;
    deudorDescripcion: string;

    acreedorSeleccionado: number | null;
    acreedorDescripcion: string;

    tipoPrestamoSeleccionado: number | null;
    tipoPrestamoDescripcion: string;

    fechaInicioValidez: Date | null;
    fechaDesembolso: Date | null;
    fechaInicioIntereses: Date | null;
    fechaVencimiento: Date | null;

    monedaSeleccionada: number | null;
    monedaDescripcion: string;

    nominal: string;
    tasaAmortizacion: string;
    cuotaInicioAmortizacion: number | null;

    periodicidadSeleccionada: number | null;
    periodicidadDescripcion: string;

    tipoTasaSeleccionado: number;
    tipoTasaDescripcion: string;

    porcentaje: string;
    tasaReferencia: string;
    rateAdjustment: string;
    applicableMargin: string;
    otros: string;
    excepcionTasaAmortizacion: boolean;
    operacionTrm: number | null;

    basisSeleccionado: number | null;
    basisDescripcion: string;

    tasaNominalEfectiva: number | null;
    tasaNominalEfectivaDescripcion: string;
}