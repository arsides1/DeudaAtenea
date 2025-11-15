// ============ prepagos.component.ts COMPLETO ============

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DebtDetail, DebtScheduleRequest, DebtScheduleBackend } from 'src/app/models/Tesoreria/Deuda/models';
import { DeudaService } from 'src/app/shared/services/deuda.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalculosDeudaService } from 'src/app/shared/services/calculos-deuda.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDialog } from '@angular/material/dialog';
import { CronogramaComponent } from '../cronograma/cronograma.component';
import { ExcepcionComponent } from '../excepcion/excepcion.component';

export interface Cuota {
  numero: number;               // Número de cuota (opcional)
  fechaPago: string | Date;     // Fecha de pago (ISO string o Date)
  cuotaTotal: number;           // Monto total de la cuota
  interes: number;              // Monto de interés
  amortizacion: number;         // Monto de amortización
  saldo: number;                // Saldo restante después de la cuota
  interestRate?: number;        // Tasa de interés aplicable (si varía por cuota)
  finalBalance?: number;        // Saldo final de esta cuota (si lo manejas así)
}


export const MY_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-prepagos',
  templateUrl: './prepagos.component.html',
  styleUrls: ['./prepagos.component.scss'],
  providers: [
      DatePipe,
      { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    ],

})
export class PrepagosComponent  {
  cuotas: Cuota[] = [];

  toDay = new Date();
  minAllowedDate: Date | null = null;
  maxAllowedDate: Date | null = null;

  numeroCuota: number = 0;
  paymentTypeId: number = 0;

  private _data: { debt: DebtDetail; schedules: DebtScheduleBackend[] };

 @Input() set data(value: { debt: DebtDetail; schedules: DebtScheduleBackend[] }) {
    if (!value || !value.debt || !value.schedules) {
      console.warn('Datos incompletos en PrepagosComponent:', value);
      return;
    }
    this._data = value;
    this.inicializarFormulario(value);
  }



  @Output() close = new EventEmitter<boolean>();

  prepaymentForm: FormGroup;
  minFechaPermitida: Date;

  constructor(
    private fb: FormBuilder,
    private deudaService: DeudaService,
    private calculosService: CalculosDeudaService,
    private modalService: NgbModal,
    private dialog: MatDialog
  ) {
    this.prepaymentForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      lastPaymentDate: [''],
      prepaymentDate: ['', Validators.required],
      prepaymentAmount: [null, [Validators.required, Validators.min(0)]],
      prepaymentInterest: [null],
      nextInterestRate: [null],
      prepaidInstallmentAmount: [null],
      nominalClosing: [null],
      nominalOpening: [null]
    });
  }

  private mapScheduleFromBackend(schedule: DebtScheduleBackend): DebtScheduleRequest {
    return {
      //seq: schedule.id || undefined,
      paymentNumber: schedule.paymentNumber || undefined,
      periodDate: schedule.calculationDate || undefined,
      paymentDate: schedule.paymentDate || undefined,
      //currency: schedule.currency || undefined,
      nominalOpening: schedule.initialBalance || undefined,
      nominalClosing: schedule.finalBalance || undefined,
      nominal: schedule.initialBalance || undefined,
      amortizationPrinc: schedule.amortization || undefined,
      interestPaid: schedule.interest || undefined,
      rate: schedule.appliedRate || undefined,
      rateType: schedule.rateType,
      referenceRate: schedule.referenceRate,
      variableRateDate: schedule.variableRateDate,
      interestRate: schedule.interestRate || undefined,
      rateAdjustment: schedule.rateAdjustment || undefined,
      applicableMargin: schedule.applicableMargin || undefined,
      fee: schedule.installment || undefined,
      finalGuarantor: schedule.finalGuarantor,
      insurance: schedule.insurance || undefined,
      provider: schedule.provider,
      acceptanceDate: schedule.acceptanceDate,
      fees: schedule.fees || undefined,
      status: schedule.status || 0,
      registeredBy: schedule.registeredBy,
      paymentDisplayLabel: schedule.paymentDisplayLabel || undefined,
      paymentTypeId: schedule.paymentTypeId || undefined
    };
  }

  private inicializarFormulario(data: { debt: DebtDetail; schedules: DebtScheduleBackend[] }): void {
    console.log("En PREPAGO - CRONOGRAMA", data.schedules);
    console.log("En PREPAGO - CABECERA", data.debt);
    this.obteniendLimitesdePrepago()

    this.prepaymentForm.get('prepaymentDate')?.valueChanges.subscribe((fecha: Date) => {
      this.actualizarDatosPorFechaPrepago(fecha);
    });



    this.prepaymentForm.get('prepaymentAmount')?.valueChanges.subscribe((valor: string) => {
      const limpio = valor.replace(/[^\d.-]/g, '');
      const monto = parseFloat(limpio);
      if (!isNaN(monto) && monto > 0) {

        this.calcularInteresPorAmortizacion(monto);
      } else {
        this.prepaymentForm.patchValue({ prepaymentInterest: null });
      }
    });


    //this.minFechaPermitida = this.obtenerUltimaFechaPago();
  }


  private obteniendLimitesdePrepago(){
    const cuotas = this._data.schedules
      .filter(s => s.paymentDate !== undefined)
      .map(s => ({
        ...s,
        fechaPago: this.numberToDate(s.paymentDate!)
      }))
      .filter(({ fechaPago }) => !isNaN(fechaPago.getTime()))
      .sort((a, b) => a.fechaPago.getTime() - b.fechaPago.getTime());

    // Busca la próxima cuota después de HOY
    const index = cuotas.findIndex(({ fechaPago }) => fechaPago.getTime() > this.toDay.getTime());
    const cuotaSiguiente = index >= 0 && index < cuotas.length ? cuotas[index] : null;

    // ✅ Fecha mínima: HOY (fecha actual)
    // ✅ Fecha máxima: Próxima cuota por vencer
    this.minAllowedDate = this.toDay;                        // ✅ CAMBIO: HOY en lugar de última cuota
    this.maxAllowedDate = cuotaSiguiente?.fechaPago ?? null; // ✅ Próxima cuota
  }

  /** Obteniendo los datos de Fecha de Ultima Cuota y tasa de interes siguiente **/
  private actualizarDatosPorFechaPrepago(fechaPrepago: Date): void {
    //console.log("el parametro de fecha",fechaPrepago)
    if (!fechaPrepago || !this._data?.schedules) return;

    const prepagoTime = fechaPrepago.getTime();

    const cuotas = this._data.schedules
      .filter(s => s.paymentDate !== undefined)
      .map(s => ({
        ...s,
        fechaPago: this.numberToDate(s.paymentDate!)
      }))
      .filter(({ fechaPago }) => !isNaN(fechaPago.getTime()))
      .sort((a, b) => a.fechaPago.getTime() - b.fechaPago.getTime());

    const index = cuotas.findIndex(({ fechaPago }) => fechaPago.getTime() > prepagoTime);
      console.log("Indice de fila", index)
    const cuotaAnterior = index > 0 ? cuotas[index - 1] : null;
    const cuotaSiguiente = index >= 0 && index < cuotas.length ? cuotas[index] : null;

    this.minAllowedDate = cuotaAnterior?.fechaPago ?? null;
    this.maxAllowedDate = cuotaSiguiente?.fechaPago ?? null;

    this.numeroCuota = cuotaAnterior ? index : 0;

    const saldoFinal =  cuotaAnterior?.finalBalance ?? 0;
      //console.log("SALDO FINAL",saldoFinal)


      this.prepaymentForm.patchValue({
        lastPaymentDate: cuotaAnterior?.fechaPago ?? null,
        nextInterestRate: cuotaSiguiente?.interestRate ?? null,
        nominalOpening: cuotaAnterior?.finalBalance ?? null
      });
    //}
  }

  /** Calculando el Interes y el monto de la Cuota **/
  private calcularInteresPorAmortizacion(monto: number): void {

    const fechaPrepago: Date = this.prepaymentForm.get('prepaymentDate')?.value;
    const fechaUltimoPago: Date = this.prepaymentForm.get('lastPaymentDate')?.value;

    //console.log("fechaPrepago",fechaPrepago)
    //console.log("fechaUltimoPago",fechaUltimoPago)
    const tasaInteres: number = this.prepaymentForm.get('nextInterestRate')?.value;
    const saldoInicial: number = this.prepaymentForm.get('nominalOpening')?.value;
    const roundingTypeId =  this._data.debt.roundingTypeId ?? 0;

    if (!monto || !fechaPrepago || !fechaUltimoPago || !tasaInteres) return;
    const dias = this.diasEntreFechas(fechaUltimoPago, fechaPrepago);
    const interes = monto * (dias / 360) * tasaInteres;
    console.log("dias", dias);

    this.prepaymentForm.patchValue({
      prepaymentInterest: this.calculosService.aplicarRedondeo(interes,roundingTypeId),
      prepaidInstallmentAmount: this.calculosService.aplicarRedondeo(monto + interes,roundingTypeId),
      nominalClosing: this.calculosService.aplicarRedondeo(saldoInicial - monto, roundingTypeId )
    });
  }

  private diasEntreFechas(fechaInicio: Date, fechaFin: Date): number {
    const msPorDia = 1000 * 60 * 60 * 24;
    const diff = fechaFin.getTime() - fechaInicio.getTime();
    return Math.max(Math.floor(diff / msPorDia), 0);
  }


  insertarCuotaPrepago(): void {
    const form = this.prepaymentForm;
    if (!form.valid) return;

    this.ObtenerPrepagoParcialTotal();

    //console.log("QUE LLEGA?", new Date(form.get('prepaymentDate')?.value))
    const nuevaCuotaPrepago: DebtScheduleBackend = {
      paymentNumber: this.numeroCuota + 1,
      paymentDate: this.dateToNumber(new Date(form.get('prepaymentDate')?.value)),
      calculationDate:this.dateToNumber(new Date(form.get('prepaymentDate')?.value)),
      initialBalance: form.get('nominalOpening')?.value,
      finalBalance:  form.get('nominalClosing')?.value,
      amortization: form.get('prepaymentAmount')?.value,
      interest: form.get('prepaymentInterest')?.value,
      interestRate: null,
      variableRateDate: null,
      appliedRate: null,
      rateAdjustment: null,
      applicableMargin: null,
      installment: form.get('prepaidInstallmentAmount')?.value,
      finalGuarantor: '',
      rateType: '',
      referenceRate: '',
      provider: '',
      acceptanceDate: null,
      fees: null,
      insurance: null,
      registeredBy: this._data.debt.registeredBy,
      paymentDisplayLabel: 'Prepago',
      status: 1,
      paymentTypeId: this.paymentTypeId
    }

    this.recalcularCuotasPosteriores()
    console.log('Cuota de prepago insertada en posición', this.numeroCuota );

    this._data.schedules.splice(this.numeroCuota , 0, nuevaCuotaPrepago);
    console.log("Nuevo Cronograma", this._data.schedules)
    //this.dataSource.data = [...this._data.schedules];
    
  }

  private ObtenerPrepagoParcialTotal(): void {
    let roundingTypeId = this._data.debt.roundingTypeId ?? 0;
    const saldo = this.calculosService.aplicarRedondeo(
      this.prepaymentForm.get('nominalClosing')?.value, roundingTypeId);

    // PREPAGO_TOTAL --- PREPAGO_PARCIAL
    if (saldo <= 0) {          
      this.paymentTypeId = 3
    } else {
      this.paymentTypeId = 2
    }
  }

  private recalcularCuotasPosteriores(): void {
    console.log("recalcularCuotasPosteriores","entrando a recalcularCuotasPosteriores");
    const cuotas = this._data.schedules?? [];
    const roundingTypeId = this._data.debt.roundingTypeId ?? 0;
    const numeroCuotaPrepago = this.numeroCuota; //--> la cuota anterior al prepago

    if (cuotas.length === 0 || numeroCuotaPrepago == null || numeroCuotaPrepago >= cuotas.length - 1) return;

    let saldoAnterior = this.calculosService.aplicarRedondeo(
      this.prepaymentForm.get('nominalClosing')?.value, roundingTypeId);

    let saldo = this.calculosService.aplicarRedondeo(
      this.prepaymentForm.get('nominalClosing')?.value, roundingTypeId);

    // if (saldoAnterior <= 0) {
    //   console.warn('Saldo final del prepago es cero. No se recalculan cuotas posteriores.');
    //   return;
    // }

    console.log("fecha anterior",this._data.schedules[numeroCuotaPrepago].paymentDate)

    //let fechaAnterior = new Date(cuotas[numeroCuotaPrepago].paymentDate as number); //.fechaPago);
    let fechaAnterior = this.parseDate(this._data.schedules[numeroCuotaPrepago - 1].paymentDate)
    console.log("fecha anterior", fechaAnterior)
    console.log("la fila de inicio", numeroCuotaPrepago)
    for (let i = numeroCuotaPrepago; i < this._data.schedules.length; i++) {
        
        this._data.schedules[i].initialBalance = this.calculosService.aplicarRedondeo(saldoAnterior, roundingTypeId)
        const saldoInicial = this._data.schedules[i].initialBalance ?? 0;
        const amortizacion = this._data.schedules[i].amortization ?? 0;
        const saldoFinal= this.calculosService.aplicarRedondeo(saldoInicial - amortizacion, roundingTypeId)
        this._data.schedules[i].paymentNumber = i + 2;
        console.log("saldoAnterior "+i, saldo.toString())
        if (saldoFinal > 0){
          this._data.schedules[i].finalBalance = saldoFinal
        } 

        if (saldo <= 0) {
          this._data.schedules[i].status = 0
        }
       console.log("status", this._data.schedules[i])

        //console.log( "fecha anterior "+ i, fechaAnterior)
        const fechaActual = this.parseDate(this._data.schedules[i].paymentDate)
       // console.log( "fecha actual " +i, this.parseDate(this._data.schedules[i].paymentDate))
        const dias = this.diasEntreFechas(fechaAnterior, fechaActual)
        fechaAnterior = this.parseDate(this._data.schedules[i].paymentDate)
        //console.log("los dias", dias)

        const tasaInteres = this._data.schedules[i].interestRate ?? 0; //--> tasa de la cuota
        const interes = saldoAnterior * (dias / 360) * tasaInteres / 100;
        this._data.schedules[i].interest = this.calculosService.aplicarRedondeo(interes, roundingTypeId);



      /*if (saldoAnterior <= 0) {
        // Opcional: marcar cuota como eliminada o vacía
        cuotas[i].interestPaid =0; //.interes = 0;
        cuotas[i].amortizationPrinc=0; // amortizacion = 0;
        cuotas[i].saldo = 0;
        continue;
      }*/


      saldoAnterior = this._data.schedules[i].finalBalance ?? 0 //cuotaActual.nominalClosing;
    }
  }

  /*@Input() data: { debt: DebtDetail; schedules: DebtScheduleRequest[] };
  @Output() close = new EventEmitter<boolean>();

  prepaymentForm: FormGroup;
  minFechaPermitida: Date;

  constructor(
    private fb: FormBuilder,
    private deudaService: DeudaService,
    private calculosService: CalculosDeudaService,
    private modalService: NgbModal
  ) {
    this.prepaymentForm = this.createForm();
  }

  ngOnInit(): void {
    console.log("En PREPAGO - CRONOGRAMA", this.data.schedules);
    console.log("En PREPAGO - CABECERA", this.data.debt);

    const ultimaFecha = this.obtenerUltimaFechaPago();
    this.minFechaPermitida = ultimaFecha;

    this.prepaymentForm.patchValue({
      prepaymentDate: ultimaFecha
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      lastPaymentDate: [null],
      prepaymentDate: [null, Validators.required],
      prepaymentAmount: [null, [Validators.required, Validators.min(0)]],
      prepaymentInterest: [null],
      nextInterestRate: [null],
      prepaidInstallmentAmount: [null]
    });
  }

  /**
   * Obtiene la última fecha de pago que ya pasó (más cercana a hoy)
   */

  /*private obtenerUltimaFechaPago(): Date {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const cuotasPasadas = this.data.schedules.filter(s => {
      const fechaCuota = this.numberToDate(s.paymentDate || 0);
      console.log()
      return fechaCuota <= hoy;
    });

    const schedulesOrdenados = cuotasPasadas.sort((a, b) =>
      (b.paymentDate || 0) - (a.paymentDate || 0)
    );

    const ultimaFechaNumber = schedulesOrdenados[0]?.paymentDate || this.data.debt.disbursementDate || 0;
    return this.numberToDate(ultimaFechaNumber);
  }*/

/*
  obtenerTasa() {
    const fechaPrepago: Date = new Date(this.prepaymentForm.get('prepaymentDate')!.value);
    const dateFP = this.dateToNumber(fechaPrepago);
    const roundingTypeId = this.data.debt.roundingTypeId || 0;

    console.log("📅 Fecha prepago:", dateFP);

    const schedulesOrdenados = [...this.data.schedules].sort((a, b) =>
      (a.paymentDate || 0) - (b.paymentDate || 0)
    );

    console.log("📊 Cronograma ordenado:", schedulesOrdenados);

    let cuotaAnterior: DebtScheduleRequest | null = null;
    let cuotaSiguiente: DebtScheduleRequest | null = null;

    for (let i = 0; i < schedulesOrdenados.length; i++) {
      const schedule = schedulesOrdenados[i];
      const fechaCuota = schedule.paymentDate || 0;

      if (fechaCuota < dateFP) {
        cuotaAnterior = schedule;
      } else if (fechaCuota >= dateFP && !cuotaSiguiente) {
        cuotaSiguiente = schedule;
        break;
      }
    }

    console.log("⬅️ Cuota anterior:", cuotaAnterior);
    console.log("➡️ Cuota siguiente:", cuotaSiguiente);

    let tasaAplicable = 0;
    let fechaAnterior = 0;

    if (cuotaSiguiente) {
      tasaAplicable = cuotaSiguiente.interestRate || 0;
      fechaAnterior = cuotaAnterior ? (cuotaAnterior.paymentDate || 0) : dateFP;
    } else if (cuotaAnterior) {
      tasaAplicable = cuotaAnterior.interestRate || 0;
      fechaAnterior = cuotaAnterior.paymentDate || 0;
    } else {
      tasaAplicable = this.data.debt.fixedRatePercentage || 0;
      fechaAnterior = this.dateToNumber(new Date(this.data.debt.disbursementDate || new Date()));
    }

    console.log("💰 Tasa aplicable:", tasaAplicable);

    const dias = this.calcularDias(fechaAnterior, dateFP);
    console.log("📆 Días:", dias);

    const montoAmortizacion = this.prepaymentForm.get('prepaymentAmount')?.value || 0;
    const saldoActual = cuotaAnterior?.nominalClosing || this.data.debt.nominal || 0;

    const interes = saldoActual * (tasaAplicable / 100) * (dias / 360);

    console.log("💵 Interés calculado:", interes);
    console.log("💰 Saldo actual:", saldoActual);

    this.prepaymentForm.patchValue({
      prepaymentInterest: this.calculosService.aplicarRedondeo(interes, roundingTypeId),
      nextInterestRate: tasaAplicable,
      prepaidInstallmentAmount: this.calculosService.aplicarRedondeo(montoAmortizacion + interes, roundingTypeId)
    }, { emitEvent: false });

    if (cuotaAnterior) {
      const filaDuplicada: DebtScheduleRequest = { ...cuotaAnterior };
      filaDuplicada.paymentDate = dateFP;
      filaDuplicada.rate = tasaAplicable;
      filaDuplicada.nominalClosing = montoAmortizacion;
      filaDuplicada.interestPaid = interes;
      filaDuplicada.fees = montoAmortizacion + interes;
      (filaDuplicada as any).esPrepago = true;

      const indexOriginal = this.data.schedules.findIndex(s =>
        s.paymentDate === cuotaAnterior!.paymentDate
      );

      if (indexOriginal !== -1) {
        this.data.schedules.splice(indexOriginal + 1, 0, filaDuplicada);
        console.log("🆕 Fila duplicada insertada:", filaDuplicada);
      }
    }

    return {
      tasa: tasaAplicable,
      interes: interes,
      dias: dias,
      fechaAnterior: fechaAnterior,
      cuotaAnterior: cuotaAnterior,
      cuotaSiguiente: cuotaSiguiente
    };
  }
*/
/*
  private calcularDias(fechaInicio: number, fechaFin: number): number {
    const inicio = this.numberToDate(fechaInicio);
    const fin = this.numberToDate(fechaFin);
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
*/

  private numberToDate(dateNumber: number): Date {
    const dateStr = dateNumber.toString();
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
  }

  private dateToNumber(date: Date): number {
    console.log("en dateToNumber", date)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return parseInt(`${year}${month}${day}`);
  }

  private parseDate(dateValue: any): Date {
    if (typeof dateValue === 'number') {
      const str = dateValue.toString();
      const year = parseInt(str.substring(0, 4));
      const month = parseInt(str.substring(4, 6)) - 1;
      const day = parseInt(str.substring(6, 8));
      return new Date(year, month, day);
    }
    return new Date(dateValue);
  }

  cerrar(): void {
    this.close.emit(true);
    this.modalService.dismissAll();
  }

  guardarPrepago() {
    if (this.prepaymentForm.valid) {
      //const resultado = this.obtenerTasa();
      this.insertarCuotaPrepago();
      console.log("💾 Guardando prepago con resultado:");
      this.openScheduleDialog();
    } else {
      console.warn('Formulario inválido');
      Object.keys(this.prepaymentForm.controls).forEach(key => {
        this.prepaymentForm.get(key)?.markAsTouched();
      });
    }
  }

  totalesAgregados: any = {
    totalDeudaBancaria: 0,
    totalDeudaMes: 0,
    deudaPorMoneda: {},
    deudaPorInstrumento: {},
    tasaAntesCobertura: 0,
    tasaDespuesCobertura: 0
  };

//jenny
  openScheduleDialog(): void {
      const formValue = this.prepaymentForm.getRawValue();
      console.log("OpenScheduleDialog", formValue)
      console.log("OpenScheduleDialog - this._data.schedules", this._data.schedules)
      const schedules = this._data.schedules.map((schedule: any) =>
            this.mapScheduleFromBackend(schedule)
          );
      console.log("OpenScheduleDialog - schedules", schedules)

      const dialogRef = this.dialog.open(CronogramaComponent, {
        width: '95%',
        maxWidth: '1400px',
        height: '90vh',
        data: { //-- > Datos que se envian al Dialog: Cronograma
          schedules: schedules,
          debtData: this._data.debt,
          isEditMode: true,
          totalesAgregados: this.totalesAgregados,
          isPreview: true,
          modo: 'editar'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Cronograma confirmado:', result);
          if (result.schedules) {
            this._data.schedules = result.schedules;
          }
        }
      });
    }

    /* openExceptionDialog(): void {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '600px',
        data: {
          excepciones: this.excepcionesGuardadas,
          numeroTotalCuotas: this.calculateTotalPeriods()
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Excepciones guardadas:', result);
          this.excepcionesGuardadas = result;
          this.prepaymentForm.patchValue({ applyAmortizationException: true });

          if (this.validateFormBeforeGenerateSho()) {
            const formValue = this.prepareDataForCalculation();
            this.schedules = this.calculateSchedule(formValue);
          }
        }
      });
    } */
//jenny

  formatearValorNumeric(event: any, esConComas: boolean): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9.]/g, '');

    if (!value || value === '' || value === '.') {
      input.value = '';
      const fieldName = input.getAttribute('formControlName');
      if (fieldName) {
        this.prepaymentForm.get(fieldName)?.setValue(null);
      }
      return;
    }

    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    const fieldName = input.getAttribute('formControlName');

    if (fieldName) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        this.prepaymentForm.get(fieldName)?.setValue(numericValue, { emitEvent: false });

        if (esConComas) {
          const formatted = numericValue.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: parts[1]?.length || 0
          });
          input.value = formatted;
        } else {
          input.value = value;
        }
      }
    }
  }

}
