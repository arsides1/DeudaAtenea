import { Injectable } from '@angular/core';

/**
 * Interfaces para los cálculos
 */
export interface ScheduleItem {
  paymentNumber: number;
  periodDate: number;
  paymentDate: number;
  dias: number;
  nominalOpening: number;
  amortizationPrinc: number;
  interestPaid: number;
  fee: number;
  nominalClosing: number;
  rate: number;
  currency: string;
  nominal: number;
  rateType: string;
  termSofrAdj: number;
  applicableMargin: number;
  prepayment?: number;
  referenceRate?: string;
  variableRateDate?: number | null;
  interestRate?: number;
  finalGuarantor?: number;
  insurance?: number;
  status?: boolean;
  registeredBy?: string;
}

export interface ParametrosCalculo {
  nominal: number;
  numCuotas: number;
  cuotaInicioAmortizacion?: number;
  fechaDesembolso: Date;
  fechaInicioIntereses: Date;
  periodicidad: number;
  base: number;
  currencyId: string;
  rateTypeId: string;
  tasaFija?: number;
  tipoTasa?: string;
  tasaReferencia?: number;
  termSofrAdj?: number;
  applicableMargin?: number;
  amortizationRate?: number;
  excepciones?: Array<{cuota: number; tasa: number}>;
  registeredBy?: string;
}

/**
 * Servicio de Cálculos de Deuda - Basado en fórmulas exactas del Excel Atenea
 */
@Injectable({
  providedIn: 'root'
})
export class CalculosDeudaService {

  constructor() { }

  /**
   * Convierte TEA a tasa período según días
   * Fórmula Excel Atenea: (1 + TEA)^(días/360) - 1
   */
  convertirTEAaPeriodo(tea: number, dias: number): number {
    // TEA viene en porcentaje, ej: 12% = 12
    return Math.pow(1 + tea / 100, dias / 360) - 1;
  }

  /**
   * Convierte TNA a tasa período según días
   * Fórmula Excel Atenea: TNA * (días/360)
   */
  convertirTNAaPeriodo(tna: number, dias: number): number {
    // TNA viene en porcentaje, ej: 8% = 8
    return (tna / 100) * (dias / 360);
  }

  /**
   * Calcula interés según tipo de tasa - FÓRMULAS EXACTAS DEL EXCEL
   * TEA: Saldo × ((1 + TEA)^(días/360) - 1)
   * TNA: Saldo × TNA × (días/360)
   */
  calcularInteres(saldo: number, tasa: number, dias: number, tipoTasa: string): number {
    if (tipoTasa === 'TEA') {
      // Fórmula Excel: Saldo × ((1 + TEA)^(días/360) - 1)
      return saldo * (Math.pow(1 + tasa / 100, dias / 360) - 1);
    } else { // TNA
      // Fórmula Excel: Saldo × TNA × (días/360)
      return saldo * (tasa / 100) * (dias / 360);
    }
  }

  /**
   * Calcula días entre dos fechas
   */
  calcularDias(fechaInicio: Date, fechaFin: Date, base: number = 360): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    const dias = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / msPerDay);

    // Para base 30/360 se ajusta el cálculo
    if (base === 360) {
      return this.calcularDias360(fechaInicio, fechaFin);
    }

    return dias;
  }

  /**
   * Cálculo de días base 30/360
   */
  private calcularDias360(fechaInicio: Date, fechaFin: Date): number {
    let d1 = fechaInicio.getDate();
    let m1 = fechaInicio.getMonth() + 1;
    let y1 = fechaInicio.getFullYear();

    let d2 = fechaFin.getDate();
    let m2 = fechaFin.getMonth() + 1;
    let y2 = fechaFin.getFullYear();

    // Ajustes según convención 30/360
    if (d1 === 31) d1 = 30;
    if (d2 === 31 && d1 === 30) d2 = 30;

    return (y2 - y1) * 360 + (m2 - m1) * 30 + (d2 - d1);
  }

  /**
   * CÁLCULO CAPITAL CONSTANTE (CAPCONST)
   */
  calcularCapitalConstante(params: ParametrosCalculo): ScheduleItem[] {
    const schedules: ScheduleItem[] = [];
    let saldoInicial = params.nominal;
    const numCuotas = params.numCuotas;
    const cuotaInicioAmort = params.cuotaInicioAmortizacion || 1;

    // Calcular número de cuotas con amortización
    const cuotasConAmortizacion = numCuotas - cuotaInicioAmort + 1;
    const amortizacionPorCuota = cuotasConAmortizacion > 0 ? params.nominal / cuotasConAmortizacion : 0;

    for (let i = 1; i <= numCuotas; i++) {
      const fechaPago = this.calcularFechaPago(params.fechaDesembolso, i, params.periodicidad);
      const fechaCalculo = i === 1 ? params.fechaInicioIntereses :
        this.calcularFechaPago(params.fechaDesembolso, i - 1, params.periodicidad);

      const dias = this.calcularDias(fechaCalculo, fechaPago, params.base);

      // Amortización solo a partir de cuota inicio
      const amortizacion = i >= cuotaInicioAmort ? amortizacionPorCuota : 0;

      // Calcular interés
      let tasaAplicar = params.tasaFija || 0;
      if (params.tipoTasa === 'VARIABLE') {
        tasaAplicar = (params.tasaReferencia || 0) + (params.termSofrAdj || 0) + (params.applicableMargin || 0);
      }

      const interes = this.calcularInteres(saldoInicial, tasaAplicar, dias, params.rateTypeId);

      const saldoFinal = Math.max(0, saldoInicial - amortizacion);
      const cuotaTotal = amortizacion + interes;

      schedules.push({
        paymentNumber: i,
        periodDate: this.dateToNumber(fechaCalculo),
        paymentDate: this.dateToNumber(fechaPago),
        dias: dias,
        nominalOpening: saldoInicial,
        amortizationPrinc: amortizacion,
        interestPaid: interes,
        fee: cuotaTotal,
        nominalClosing: saldoFinal,
        rate: tasaAplicar,
        currency: params.currencyId,
        nominal: params.nominal,
        rateType: params.rateTypeId,
        termSofrAdj: params.termSofrAdj || 0,
        applicableMargin: params.applicableMargin || 0
      });

      saldoInicial = saldoFinal;
    }

    // Ajustar última cuota para cerrar en 0
    if (schedules.length > 0) {
      const lastSchedule = schedules[schedules.length - 1];
      if (lastSchedule.nominalClosing > 0 && lastSchedule.nominalClosing < 1) {
        lastSchedule.amortizationPrinc += lastSchedule.nominalClosing;
        lastSchedule.fee = lastSchedule.amortizationPrinc + lastSchedule.interestPaid;
        lastSchedule.nominalClosing = 0;
      }
    }

    return schedules;
  }

  /**
   * CÁLCULO CAPITAL VARIABLE (CAPVAR)
   */
  calcularCapitalVariable(params: ParametrosCalculo): ScheduleItem[] {
    const schedules: ScheduleItem[] = [];
    let saldoInicial = params.nominal;
    const numCuotas = params.numCuotas;
    const tasaBaseAmort = (params.amortizationRate || 20) / 100; // Default 20%

    for (let i = 1; i <= numCuotas; i++) {
      const fechaPago = this.calcularFechaPago(params.fechaDesembolso, i, params.periodicidad);
      const fechaCalculo = i === 1 ? params.fechaInicioIntereses :
        this.calcularFechaPago(params.fechaDesembolso, i - 1, params.periodicidad);

      const dias = this.calcularDias(fechaCalculo, fechaPago, params.base);

      // Buscar excepción para esta cuota
      let tasaAmortizacion = tasaBaseAmort;
      const excepcion = params.excepciones?.find((e: any) => e.cuota === i);
      if (excepcion) {
        tasaAmortizacion = excepcion.tasa / 100;
      }

      // Amortización por porcentaje del nominal original
      let amortizacion = params.nominal * tasaAmortizacion;

      // Si es última cuota, ajustar para cerrar
      if (i === numCuotas || saldoInicial - amortizacion <= 0) {
        amortizacion = saldoInicial;
      }

      // Calcular interés
      let tasaAplicar = params.tasaFija || 0;
      if (params.tipoTasa === 'VARIABLE') {
        tasaAplicar = (params.tasaReferencia || 0) + (params.termSofrAdj || 0) + (params.applicableMargin || 0);
      }

      const interes = this.calcularInteres(saldoInicial, tasaAplicar, dias, params.rateTypeId);

      const saldoFinal = Math.max(0, saldoInicial - amortizacion);
      const cuotaTotal = amortizacion + interes;

      schedules.push({
        paymentNumber: i,
        periodDate: this.dateToNumber(fechaCalculo),
        paymentDate: this.dateToNumber(fechaPago),
        dias: dias,
        nominalOpening: saldoInicial,
        amortizationPrinc: amortizacion,
        interestPaid: interes,
        fee: cuotaTotal,
        nominalClosing: saldoFinal,
        rate: tasaAplicar,
        currency: params.currencyId,
        nominal: params.nominal,
        rateType: params.rateTypeId,
        termSofrAdj: params.termSofrAdj || 0,
        applicableMargin: params.applicableMargin || 0
      });

      saldoInicial = saldoFinal;

      if (saldoFinal === 0) break;
    }

    return schedules;
  }

  /**
   * CÁLCULO CUOTA CONSTANTE (Sistema Francés)
   */
  calcularCuotaConstante(params: ParametrosCalculo): ScheduleItem[] {
    const schedules: ScheduleItem[] = [];
    let saldoInicial = params.nominal;
    const numCuotas = params.numCuotas;

    // Calcular tasa efectiva por período
    let tasaAplicar = params.tasaFija || 0;
    if (params.tipoTasa === 'VARIABLE') {
      tasaAplicar = (params.tasaReferencia || 0) + (params.termSofrAdj || 0) + (params.applicableMargin || 0);
    }

    // Calcular días promedio del período
    const diasPeriodo = this.getDiasPorPeriodo(params.periodicidad);
    let tasaPeriodo = 0;

    if (params.rateTypeId === 'TEA') {
      tasaPeriodo = this.convertirTEAaPeriodo(tasaAplicar, diasPeriodo);
    } else {
      tasaPeriodo = this.convertirTNAaPeriodo(tasaAplicar, diasPeriodo);
    }

    // Calcular cuota constante (fórmula de anualidad)
    const cuotaConstante = this.calcularAnualidad(params.nominal, tasaPeriodo, numCuotas);

    for (let i = 1; i <= numCuotas; i++) {
      const fechaPago = this.calcularFechaPago(params.fechaDesembolso, i, params.periodicidad);
      const fechaCalculo = i === 1 ? params.fechaInicioIntereses :
        this.calcularFechaPago(params.fechaDesembolso, i - 1, params.periodicidad);

      const dias = this.calcularDias(fechaCalculo, fechaPago, params.base);

      // Calcular interés del período
      const interes = this.calcularInteres(saldoInicial, tasaAplicar, dias, params.rateTypeId);

      // Amortización = Cuota - Interés
      let amortizacion = cuotaConstante - interes;

      // Ajustar última cuota
      if (i === numCuotas || saldoInicial - amortizacion <= 0) {
        amortizacion = saldoInicial;
      }

      const saldoFinal = Math.max(0, saldoInicial - amortizacion);
      const cuotaTotal = amortizacion + interes;

      schedules.push({
        paymentNumber: i,
        periodDate: this.dateToNumber(fechaCalculo),
        paymentDate: this.dateToNumber(fechaPago),
        dias: dias,
        nominalOpening: saldoInicial,
        amortizationPrinc: amortizacion,
        interestPaid: interes,
        fee: cuotaTotal,
        nominalClosing: saldoFinal,
        rate: tasaAplicar,
        currency: params.currencyId,
        nominal: params.nominal,
        rateType: params.rateTypeId,
        termSofrAdj: params.termSofrAdj || 0,
        applicableMargin: params.applicableMargin || 0
      });

      saldoInicial = saldoFinal;

      if (saldoFinal === 0) break;
    }

    return schedules;
  }

  /**
   * CÁLCULO BULLET
   */
  calcularBullet(params: ParametrosCalculo): ScheduleItem[] {
    const schedules: ScheduleItem[] = [];
    const saldoInicial = params.nominal;
    const numCuotas = params.numCuotas;

    for (let i = 1; i <= numCuotas; i++) {
      const fechaPago = this.calcularFechaPago(params.fechaDesembolso, i, params.periodicidad);
      const fechaCalculo = i === 1 ? params.fechaInicioIntereses :
        this.calcularFechaPago(params.fechaDesembolso, i - 1, params.periodicidad);

      const dias = this.calcularDias(fechaCalculo, fechaPago, params.base);

      // En BULLET, amortización solo en última cuota
      const amortizacion = i === numCuotas ? saldoInicial : 0;

      // Calcular interés
      let tasaAplicar = params.tasaFija || 0;
      if (params.tipoTasa === 'VARIABLE') {
        tasaAplicar = (params.tasaReferencia || 0) + (params.termSofrAdj || 0) + (params.applicableMargin || 0);
      }

      const interes = this.calcularInteres(saldoInicial, tasaAplicar, dias, params.rateTypeId);

      const saldoFinal = i === numCuotas ? 0 : saldoInicial;
      const cuotaTotal = amortizacion + interes;

      schedules.push({
        paymentNumber: i,
        periodDate: this.dateToNumber(fechaCalculo),
        paymentDate: this.dateToNumber(fechaPago),
        dias: dias,
        nominalOpening: saldoInicial,
        amortizationPrinc: amortizacion,
        interestPaid: interes,
        fee: cuotaTotal,
        nominalClosing: saldoFinal,
        rate: tasaAplicar,
        currency: params.currencyId,
        nominal: params.nominal,
        rateType: params.rateTypeId,
        termSofrAdj: params.termSofrAdj || 0,
        applicableMargin: params.applicableMargin || 0
      });
    }

    return schedules;
  }

  /**
   * Calcular anualidad para cuota constante
   */
  private calcularAnualidad(principal: number, tasaPeriodo: number, numPeriodos: number): number {
    if (tasaPeriodo === 0) {
      return principal / numPeriodos;
    }

    const factor = Math.pow(1 + tasaPeriodo, numPeriodos);
    return principal * (tasaPeriodo * factor) / (factor - 1);
  }

  /**
   * Calcular fecha de pago según período
   */
  private calcularFechaPago(fechaInicio: Date, periodo: number, periodicidad: number): Date {
    const fecha = new Date(fechaInicio);
    const mesesPorPeriodo = this.getMesesPorPeriodo(periodicidad);
    fecha.setMonth(fecha.getMonth() + (periodo * mesesPorPeriodo));
    return fecha;
  }

  /**
   * Obtener meses por período según periodicidad
   */
  private getMesesPorPeriodo(periodicidad: number): number {
    /*const mapa: { [key: number]: number } = {
      1: 1,   // Mensual
      2: 2,   // Bimestral
      3: 3,   // Trimestral
      4: 4,   // Cuatrimestral
      6: 6,   // Semestral
      12: 12  // Anual
    };*/
    const mapa: { [key: number]: number } = {
      1: 12,
      2: 6,
      3: 4,
      4: 3,
      5: 2,
      6: 1
    };
    return mapa[periodicidad] || 3;
  }

  /**
   * Obtener días promedio por período
   */
  private getDiasPorPeriodo(periodicidad: number): number {
    const meses = this.getMesesPorPeriodo(periodicidad);
    return Math.round((meses * 30)); // Aproximación para base 360
  }

  /**
   * Convertir fecha a número formato YYYYMMDD
   */
  private dateToNumber(date: Date): number {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return parseInt(`${year}${month}${day}`);
  }

  /**
   * Calcular número de cuotas entre fechas
   */
  calcularNumeroCuotas(fechaInicio: Date, fechaFin: Date, periodicidad: number): number {
    const mesesTotal = this.calcularMesesEntreFechas(fechaInicio, fechaFin);
    const mesesPorPeriodo = this.getMesesPorPeriodo(periodicidad);
    //console.log("meses Total",mesesTotal )
    //console.log("meses periodo",mesesPorPeriodo )
    return Math.ceil(mesesTotal / mesesPorPeriodo);
  }

  /**
   * Calcular meses entre fechas
   */
  private calcularMesesEntreFechas(fecha1: Date, fecha2: Date): number {
    const yearDiff = fecha2.getFullYear() - fecha1.getFullYear();
    const monthDiff = fecha2.getMonth() - fecha1.getMonth();
    return yearDiff * 12 + monthDiff;
  }

  /**
   * Aplicar redondeo según tipo
   */
  aplicarRedondeo(valor: number, tipoRedondeo: number): number {
    switch (tipoRedondeo) {
      case 1: // Sin decimales
        return Math.round(valor);
      case 2: // Dos decimales
        return Math.round(valor * 100) / 100;
      case 4: // Cuatro decimales
        return Math.round(valor * 10000) / 10000;
      default:
        return Math.round(valor * 100) / 100;
    }
  }

  /**
   * Validar coherencia del cronograma calculado
   */
  validarCoherencia(schedules: ScheduleItem[], nominal: number): { esValido: boolean; errores: string[] } {
    const errores: string[] = [];

    // Validar suma de amortizaciones = nominal
    const totalAmortizacion = schedules.reduce((sum, s) => sum + (s.amortizationPrinc || 0), 0);
    const diferencia = Math.abs(totalAmortizacion - nominal);

    if (diferencia > 0.01) {
      errores.push(`Diferencia en amortización: ${diferencia.toFixed(2)}`);
    }

    // Validar último saldo = 0
    const ultimoSaldo = schedules[schedules.length - 1]?.nominalClosing || 0;
    if (ultimoSaldo > 0.01) {
      errores.push(`Saldo final no es cero: ${ultimoSaldo.toFixed(2)}`);
    }

    // Validar continuidad de saldos
    for (let i = 1; i < schedules.length; i++) {
      const saldoFinalAnterior = schedules[i - 1].nominalClosing;
      const saldoInicialActual = schedules[i].nominalOpening;

      if (Math.abs(saldoFinalAnterior - saldoInicialActual) > 0.01) {
        errores.push(`Discontinuidad en cuota ${i + 1}`);
      }
    }

    return {
      esValido: errores.length === 0,
      errores: errores
    };
  }
}
