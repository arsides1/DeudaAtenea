import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  EventEmitter,
  Output,
  Input,
  Inject,
  Optional
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DeudaService } from 'src/app/shared/services/deuda.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  DebtApiResponse,
  DebtScheduleRequest,
  DebtScheduleBackend,
  DebtRequest,
  ClasificacionTasa,
  mapScheduleToBackend, AmortizationExceptionRequest
} from "../../../../../models/Tesoreria/Deuda/models";
import * as XLSX from 'xlsx';

export interface DialogData {
  schedules: DebtScheduleRequest[];
  debtData?: any;
  debt?: any;
  isPreview?: boolean;
  modo?: string;
  totales?: any;
}

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatDateFormats,
} from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
  selector: 'app-cronograma',
  templateUrl: './cronograma.component.html',
  styleUrls: ['./cronograma.component.scss'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class CronogramaComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource: MatTableDataSource<any>;

  displayedColumn: string[] = [
    'fecha',
    'fecha_pago',
    'nro_pago',
    //'moneda',
    'saldo_inicial',
    'saldo_final',
    //'nominal',
    'amortizacion',
    'intereses',
    'tasa_interes',
    'tipo_tasa',
    'tasa_referencia',
    'fecha_tasa_variable',
    'tasa',
    'term_sofr_adj',
    'applicable_margin',
    'cuota',
    //'garante_final',
    'seguros'
  ];

  displayedColumns: string[] = [];

  // MAPA DE COLUMNAS POR CLASE DE PRODUCTO BASADO EN EL EXCEL
  private columnsByProductClass: { [key: string]: string[] } = {
    'PBC': [
      'fecha', 'fecha_pago', 'nro_pago', 'moneda', 'saldo_inicial', 'saldo_final',
      'amortizacion', 'intereses', 'tasa_interes', 'tipo_tasa', 'tasa_referencia',
      'fecha_tasa_variable', 'tasa', 'term_sofr_adj', 'applicable_margin', 'cuota',
      'garante_final'
    ],
    'PBL': [
      'fecha', 'fecha_pago', 'nro_pago', 'moneda', 'saldo_inicial', 'saldo_final',
      'amortizacion', 'intereses', 'tasa_interes', 'tipo_tasa', 'tasa_referencia',
      'fecha_tasa_variable', 'tasa', 'term_sofr_adj', 'applicable_margin', 'cuota',
      'garante_final'
    ],
    'IPC': [
      'fecha', 'fecha_pago', 'nro_pago', 'moneda', 'saldo_inicial', 'saldo_final',
      'amortizacion', 'intereses', 'tasa_interes', 'cuota', 'garante_final'
    ],
    'IPL': [
      'fecha', 'fecha_pago', 'nro_pago', 'moneda', 'saldo_inicial', 'saldo_final',
      'amortizacion', 'intereses', 'tasa_interes', 'cuota', 'garante_final'
    ],
    'PAC': [
      'fecha', 'fecha_pago', 'nro_pago', 'moneda', 'saldo_inicial', 'saldo_final',
      'amortizacion', 'intereses', 'tasa_interes', 'tipo_tasa', 'tasa_referencia',
      'fecha_tasa_variable', 'tasa', 'term_sofr_adj', 'applicable_margin', 'cuota',
      'garante_final'
    ],
    'PAL': [
      'fecha', 'fecha_pago', 'nro_pago', 'moneda', 'saldo_inicial', 'saldo_final',
      'amortizacion', 'intereses', 'tasa_interes', 'tipo_tasa', 'tasa_referencia',
      'fecha_tasa_variable', 'tasa', 'term_sofr_adj', 'applicable_margin', 'cuota',
      'garante_final'
    ],
    'FIC': [
      'fecha', 'fecha_pago', 'nro_pago', 'moneda', 'saldo_inicial', 'saldo_final',
      'amortizacion', 'intereses', 'tasa_interes', 'cuota'
    ],
    'FIL': [
      'fecha', 'fecha_pago', 'nro_pago', 'moneda', 'saldo_inicial', 'saldo_final',
      'amortizacion', 'intereses', 'tasa_interes', 'cuota'
    ],
    'PCM': [
      'nro_pago', 'moneda', 'saldo_inicial', 'saldo_final', 'intereses',
      'tasa_interes', 'cuota'
    ],
    'LEA': [
      'fecha', 'fecha_pago', 'nro_pago', 'moneda', 'saldo_inicial', 'saldo_final',
      'amortizacion', 'intereses', 'tasa_interes', 'cuota', 'seguros'
    ],
    'EMI': [
      'fecha', 'fecha_pago', 'nro_pago', 'moneda', 'saldo_inicial', 'saldo_final',
      'amortizacion', 'intereses', 'tasa_interes', 'tipo_tasa', 'tasa_referencia',
      'fecha_tasa_variable', 'tasa', 'term_sofr_adj', 'applicable_margin', 'cuota',
      'garante_final'
    ]
  };

  headerData: any = {
    sociedad: '',
    acreedor: '',
    tipoAcreedor: '',
    tipoPrestamo: '',
    moneda: '',
    nominal: 0,
    tasa: 0,
    saldoPorPagar: 0,
    inicioValidez: null,
    vencimiento: null,
    tipoTasa: ''
  };

  schedules: DebtScheduleRequest[] = [];
  isPreview: boolean = false;
  debtInfo: any = {};
  isFullView: boolean = false;

  totalesAgregados: any = {
    totalDeudaBancaria: 0,
    totalDeudaMes: 0,
    deudaPorMoneda: {},
    deudaPorInstrumento: {},
    tasaAntesCobertura: 0,
    tasaDespuesCobertura: 0
  };

  @Output() close = new EventEmitter<any>();
  @Input() data: any;
  @Input() visible: boolean = false;
  @Input() objForm: any;
  @Input() objIntercompany: any;

  isEditMode: boolean = false;
  debtId: string = '';


  constructor(
    private deudaService: DeudaService,
    private modalService: NgbModal,
    private router: Router,
    @Optional() public dialogRef: MatDialogRef<CronogramaComponent>,  // Hacer opcional
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any,      // Hacer opcional
    @Optional() private activeModal: NgbActiveModal
  ) {
    this.dataSource = new MatTableDataSource();
    if (!this.data && this.dialogData) {
      this.data = this.dialogData;
    }
  }

  ngOnInit(): void {
    this.isPreview = this.data?.isPreview || false;
    this.isEditMode = this.data?.modo === 'editar';
    this.debtId = this.data?.debtId || '';

    if (this.data?.totalesAgregados) {
      this.totalesAgregados = this.data.totalesAgregados;
      console.log('Totales recibidos en CronogramaComponent:', this.totalesAgregados);
    }

    if (this.data?.debt) {
      this.debtInfo = this.data.debt;
      this.schedules = this.data.debt.schedules || [];
      this.isFullView = true;
      this.prepareHeaderFromDebt();
      this.prepareFullData();
    } else if (this.data?.debtData) {
      this.debtInfo = this.data.debtData || {};
      this.schedules = this.data?.schedules || [];
      this.isFullView = false;
      this.prepareHeaderFromForm();
      this.prepareSimpleData();
    }

    if (!this.data?.totalesAgregados || Object.keys(this.data.totalesAgregados).length === 0) {
      this.calculateTotals();
    }

    // APLICAR COLUMNAS SEGÚN CLASE DE PRODUCTO
    const claseProducto = this.data?.debtData?.idClaseProducto || this.data?.debt?.productClass;

    console.log('Clase de producto detectada:', claseProducto);

    if (claseProducto && this.columnsByProductClass[claseProducto]) {
      this.displayedColumns = [...this.columnsByProductClass[claseProducto]];
      console.log('Columnas a mostrar para', claseProducto, ':', this.displayedColumns);
    } else {
      // Si no se especifica clase o no está mapeada, mostrar todas las columnas
      this.displayedColumns = [...this.displayedColumn];
      console.log('Usando columnas por defecto');
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private prepareHeaderFromDebt(): void {
    let tipoAcreedor = 'Subsidiaria';
    let nombreAcreedor = '';

    if (this.debtInfo.creditorType === 'COUNTERPART') {
      tipoAcreedor = 'Contraparte';
      nombreAcreedor = this.debtInfo.counterpartCreditorName || '';
    } else {
      tipoAcreedor = 'Subsidiaria';
      nombreAcreedor = this.debtInfo.subsidiaryCreditorName || '';
    }

    this.headerData = {
      sociedad: this.debtInfo.subsidiaryDebtorName || '',
      acreedor: nombreAcreedor,
      tipoAcreedor: tipoAcreedor,
      tipoPrestamo: this.debtInfo.loanTypeName || '',
      moneda: this.debtInfo.currencyId || '',
      nominal: this.debtInfo.nominal || 0,
      tasa: this.calculateTasa(),
      saldoPorPagar: this.calculateSaldoPorPagar(),
      inicioValidez: this.debtInfo.validityStartDate,
      vencimiento: this.debtInfo.maturityDate,
      tipoTasa: this.debtInfo.rateClassificationName || '',
      finalGuarantor: this.debtInfo.finalGuarantor || ''
    };
  }

  private prepareHeaderFromForm(): void {
    const claseProducto = this.data.debtData?.idClaseProducto;

    let tipoAcreedor = 'Subsidiaria';
    let nombreAcreedor = this.data.debtData?.acreedorDescripcion || '';

    // Para PCM no hay acreedor
    if (claseProducto === 'PCM') {
      nombreAcreedor = '';
    }

    if (this.data.debtData?.creditorType === 'COUNTERPART') {
      tipoAcreedor = 'Contraparte';
    }

    this.headerData = {
      sociedad: this.data.debtData?.deudorDescripcion || '',
      acreedor: nombreAcreedor,
      tipoAcreedor: tipoAcreedor,
      tipoPrestamo: this.data.debtData?.loanTypeDescripcion || '',
      moneda: this.data.debtData?.currencyId || this.data.debtData?.currencyDescripcion || '',
      nominal: this.data.debtData?.nominal || 0,
      tasa: this.calculateTasaFromForm(),
      saldoPorPagar: this.calculateSaldoPorPagar(),
      inicioValidez: this.data.debtData?.validityStartDate, // Solo pasar el valor
      vencimiento: this.data.debtData?.maturityDate,
      tipoTasa: this.data.debtData?.rateClassificationDescripcion || '',
      // Agregar flag para controlar qué mostrar
      mostrarAcreedor: claseProducto !== 'PCM',
      esIntercompany: ['IPC', 'IPL'].includes(claseProducto)
    };
  }

  private calculateTasa(): number {
    if (this.debtInfo.rateClassificationId === ClasificacionTasa.FIJA) {
      return this.debtInfo.fixedRatePercentage || 0;
    } else {
      return (this.debtInfo.rateAdjustment || 0) + (this.debtInfo.applicableMargin || 0);
    }
  }

  private calculateTasaFromForm(): number {
    if (this.data.debtData?.rateClassificationId === ClasificacionTasa.FIJA) {
      return this.data.debtData?.fixedRatePercentage || 0;
    } else {
      return (this.data.debtData?.rateAdjustment || 0) + (this.data.debtData?.applicableMargin || 0);
    }
  }

  private calculateSaldoPorPagar(): number {
    if (this.schedules && this.schedules.length > 0) {
      const lastSchedule = this.schedules[this.schedules.length - 1];
      return lastSchedule.nominalClosing || 0;
    }
    return this.headerData.nominal;
  }

  private calculateTotals(): void {
    const nominal = this.headerData.nominal || 0;
    const loanType = this.headerData.tipoPrestamo || 'Préstamo';
    const currency = this.headerData.moneda || 'PEN';

    this.totalesAgregados.totalDeudaBancaria = nominal;

    const mesActual = new Date();
    this.totalesAgregados.totalDeudaMes = this.schedules
      .filter(s => {
        const paymentDate = this.parseDate(s.paymentDate!);
        if (paymentDate) {
          return paymentDate.getMonth() === mesActual.getMonth() &&
            paymentDate.getFullYear() === mesActual.getFullYear();
        }
        return false;
      })
      .reduce((sum, s) => sum + (s.amortizationPrinc || 0), 0);

    const maturityDate = this.parseDate(this.data.debtData?.maturityDate || this.debtInfo.maturityDate);
    const disbursementDate = this.parseDate(this.data.debtData?.disbursementDate || this.debtInfo.disbursementDate);

    if (maturityDate && disbursementDate) {
      const plazoAnios = (maturityDate.getTime() - disbursementDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
      let categoriaPlazo = '';

      if (plazoAnios <= 1) {
        categoriaPlazo = 'Corto Plazo';
      } else if (plazoAnios <= 5) {
        categoriaPlazo = 'Mediano Plazo';
      } else {
        categoriaPlazo = 'Largo Plazo';
      }

      this.totalesAgregados.deudaPorMoneda = {
        [currency]: {
          [categoriaPlazo]: nominal
        }
      };
    }

    this.totalesAgregados.deudaPorInstrumento = {
      [loanType]: nominal
    };

    if (this.schedules && this.schedules.length > 0) {
      let sumaTasaPorSaldo = 0;
      let sumaSaldos = 0;

      this.schedules.forEach(schedule => {
        const saldo = schedule.nominalOpening || 0;
        const tasa = schedule.rate || 0;

        sumaTasaPorSaldo += tasa * saldo;
        sumaSaldos += saldo;
      });

      const tasaPromedio = sumaSaldos > 0 ? sumaTasaPorSaldo / sumaSaldos : 0;

      this.totalesAgregados.tasaAntesCobertura = tasaPromedio;
      this.totalesAgregados.tasaDespuesCobertura = tasaPromedio;
    }
  }

  private mapScheduleForView(schedule: any): any {
    const isBackendData = schedule.hasOwnProperty('initialBalance');

    console.log('Mapeando schedule:', isBackendData ? 'BACKEND' : 'PREVIEW', schedule);

    const mappedData: any = {
      nro_pago: schedule.paymentNumber,
      moneda: schedule.currency || this.headerData.moneda,
      saldo_inicial: isBackendData ? schedule.initialBalance : schedule.nominalOpening,
      saldo_final: isBackendData ? schedule.finalBalance : schedule.nominalClosing,
      amortizacion: isBackendData ? schedule.amortization : schedule.amortizationPrinc,
      intereses: isBackendData ? schedule.interest : schedule.interestPaid,
      tasa_interes: isBackendData ? schedule.interestRate : schedule.rate,
      cuota: isBackendData ? schedule.installment : schedule.fee,
      nominal: schedule.nominal || this.headerData.nominal
    };

    const fechaCalculo = isBackendData ? schedule.calculationDate : schedule.periodDate;
    if (fechaCalculo !== undefined && fechaCalculo !== null) {
      const parsedDate = this.parseDate(fechaCalculo);
      mappedData.fecha = parsedDate ? this.formatDateForDisplay(parsedDate) : '';
    }

    if (schedule.paymentDate !== undefined && schedule.paymentDate !== null) {
      const parsedDate = this.parseDate(schedule.paymentDate);
      mappedData.fecha_pago = parsedDate ? this.formatDateForDisplay(parsedDate) : '';
    }

    if (schedule.rateType !== undefined) {
      mappedData.tipo_tasa = schedule.rateType || this.headerData.tipoTasa;
    }

    if (schedule.referenceRate !== undefined) {
      mappedData.tasa_referencia = schedule.referenceRate || '';
    }

    if (schedule.variableRateDate !== undefined && schedule.variableRateDate !== null) {
      const parsedDate = this.parseDate(schedule.variableRateDate);
      mappedData.fecha_tasa_variable = parsedDate ? this.formatDateForDisplay(parsedDate) : '';
    }

    if (schedule.appliedRate !== undefined) {
      mappedData.tasa = schedule.appliedRate;
    } else if (schedule.interestRate !== undefined) {
      mappedData.tasa = schedule.interestRate;
    } else if (schedule.rate !== undefined) {
      mappedData.tasa = schedule.rate;
    }

    if (schedule.rateAdjustment !== undefined) {
      mappedData.term_sofr_adj = schedule.rateAdjustment || 0;
    }

    if (schedule.applicableMargin !== undefined) {
      mappedData.applicable_margin = schedule.applicableMargin || 0;
    }

    if (schedule.prepayment !== undefined) {
      mappedData.prepagos = schedule.prepayment || 0;
    }

    if (schedule.finalGuarantor !== undefined) {
      mappedData.garante_final = schedule.finalGuarantor || '';
    }

    if (schedule.insurance !== undefined) {
      mappedData.seguros = schedule.insurance || 0;
    }

    console.log('Schedule mapeado:', mappedData);
    return mappedData;
  }

  private formatDateForDisplay(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  private prepareFullData(): void {
    const formattedSchedules = this.schedules.map(schedule => this.mapScheduleForView(schedule));
    this.dataSource.data = formattedSchedules;
  }

  private prepareSimpleData(): void {
    const formattedSchedules = this.schedules.map(schedule => this.mapScheduleForView(schedule));
    this.dataSource.data = formattedSchedules;
  }

  parseDate(value: any): Date | null {
    if (!value) return null;

    if (value instanceof Date) {
      return value;
    }

    const str = value.toString();

    if (/^\d{8}$/.test(str)) {
      const year = parseInt(str.substring(0, 4), 10);
      const month = parseInt(str.substring(4, 6), 10) - 1;
      const day = parseInt(str.substring(6, 8), 10);
      return new Date(year, month, day);
    }

    if (/^\d{2}\/\d{2}\/\d{2}$/.test(str)) {
      const [day, month, year] = str.split('/').map(n => parseInt(n, 10));
      const fullYear = year < 50 ? 2000 + year : 1900 + year;
      return new Date(fullYear, month - 1, day);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return new Date(str);
    }

    console.warn('Formato de fecha inválido:', value);
    return null;
  }

  formatHeaderDate(dateValue: any): string {
    if (!dateValue) return '';

    let dateToFormat: Date;

    if (typeof dateValue === 'string') {
      dateToFormat = new Date(dateValue);
    }
    else if (typeof dateValue === 'number') {
      const str = dateValue.toString();
      if (str.length === 8) {
        const year = parseInt(str.substring(0, 4));
        const month = parseInt(str.substring(4, 6)) - 1;
        const day = parseInt(str.substring(6, 8));
        dateToFormat = new Date(year, month, day);
      } else {
        return dateValue.toString();
      }
    }
    else if (dateValue instanceof Date) {
      dateToFormat = dateValue;
    } else {
      return '';
    }

    const day = dateToFormat.getDate().toString().padStart(2, '0');
    const month = (dateToFormat.getMonth() + 1).toString().padStart(2, '0');
    const year = dateToFormat.getFullYear().toString();

    return `${day}/${month}/${year}`;
  }


  getTotalAmortization(): number {
    return this.dataSource.data.reduce((sum, row) => sum + (row.amortizacion || 0), 0);
  }

  getTotalInterest(): number {
    return this.dataSource.data.reduce((sum, row) => sum + (row.intereses || 0), 0);
  }

  getTotalInstallment(): number {
    return this.dataSource.data.reduce((sum, row) => sum + (row.cuota || 0), 0);
  }

  getTotalPrepayments(): number {
    return this.dataSource.data.reduce((sum, row) => sum + (row.prepagos || 0), 0);
  }

  save(): void {
    const payload = this.prepareSaveData();
    console.log("Grabando deuda:", payload )
    const saveOperation = this.data.modo === 'editar'
      ? this.deudaService.editarDeuda(this.debtId, payload)
      : this.deudaService.registrarDeuda(payload);

    saveOperation.subscribe({
      next: (response: DebtApiResponse) => {
        Swal.fire({
          icon: 'success',
          title: this.data.modo === 'editar' ? 'Deuda actualizada' : 'Deuda registrada',
          text: response.message || 'Operación exitosa',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          const result = {
            action: 'saved',
            debtId: response.data
          };

          if (this.dialogRef) {
            // Si se abrió con MatDialog
            this.dialogRef.close(result);
          } else if (this.activeModal) {
            // Si se abrió con NgbModal
            this.activeModal.close(result);
          } else {
            // Si se usa como componente hijo
            this.close.emit(result);
            this.modalService.dismissAll();
          }

          this.router.navigate(['/Registro']);
        });
      },
      error: (error) => {
        console.error('Error en save():', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message || 'No se pudo guardar la deuda'
        });
      }
    });
  }

  private prepareSaveData(): DebtRequest {
    const formatDateToInt = (date: any): number | null => {
      if (!date) return null;
      if (typeof date === 'number') return date;
      if (typeof date === 'string') {
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
          return parseInt(`${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}`);
        }
      }
      if (date instanceof Date) {
        return parseInt(`${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`);
      }
      return null;
    };

    const cleanNumeric = (value: any): number | null => {
      if (!value && value !== 0) return null;
      const cleaned = String(value).replace(/,/g, '').replace(/\s/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    };

    const creditorType = this.data.debtData?.creditorType || '';
    let subsidiaryCreditorId = null;
    let counterpartCreditorId = null;

    if (creditorType === 'SUBSIDIARY') {
      subsidiaryCreditorId = this.data.debtData?.subsidiaryCreditorId;
    } else if (creditorType === 'COUNTERPART') {
      counterpartCreditorId = this.data.debtData?.counterpartCreditorId;
    }

    // Mapear excepciones si existen
    const amortizationExceptions: AmortizationExceptionRequest[] = this.data.debtData?.excepciones?.map((exc: any) => ({
      cuotaExc: exc.quotaNumber ?? null,
      amortizationRate: exc.rate ?? null,
      resultado: exc.result ?? null,
      registeredBy: this.data.debtData?.registeredBy || ''
    })) || [];


    // Mapear schedules con TODOS los campos
    const mappedSchedules: DebtScheduleBackend[] = this.schedules.map(schedule => ({
      paymentNumber: schedule.paymentNumber ?? null,
      calculationDate: schedule.periodDate ?? null,
      paymentDate: schedule.paymentDate ?? null,
      initialBalance: schedule.nominalOpening ?? null,
      finalBalance: schedule.nominalClosing ?? null,
      amortization: schedule.amortizationPrinc ?? null,
      interest: schedule.interestPaid ?? null,
      interestRate: schedule.interestRate ?? schedule.rate ?? null,
      installment: schedule.fee ?? null,
      variableRateDate: schedule.variableRateDate || null,
      appliedRate: schedule.rate ?? null,
      rateAdjustment: schedule.rateAdjustment ?? null,
      applicableMargin: schedule.applicableMargin ?? null,
      finalGuarantor: String(schedule.finalGuarantor ?? ''),
      rateType: schedule.rateType || '',
      referenceRate: schedule.referenceRate || '',
      provider: schedule.provider || '',
      acceptanceDate: schedule.acceptanceDate ?? null,
      fees: schedule.fees ?? null,
      insurance: schedule.insurance ?? null,
      registeredBy: schedule.registeredBy ?? this.data.debtData?.registeredBy ?? ''
    }));

    //console.log("PREPAREFORMDATA",formatDateToInt(formValue.disbursementDate))
    console.log("FECHA DE DESEMBOLSO",formatDateToInt(this.data.debtData?.disbursementDate))

    const debtRequest: DebtRequest = {
      // Campos de producto
      productClassId: this.data.debtData?.idClaseProducto || '',
      productTypeId: this.data.debtData?.idTipoProducto || '',

      // Entidades principales
      subsidiaryDebtorId: this.data.debtData?.subsidiaryDebtorId ?? null,
      creditorType: creditorType,
      subsidiaryCreditorId: subsidiaryCreditorId,
      counterpartCreditorId: counterpartCreditorId,



      // Información del préstamo
      loanTypeId: this.data.debtData?.loanTypeId ?? null,
      validityStartDate: formatDateToInt(this.data.debtData?.validityStartDate),
      disbursementDate: formatDateToInt(this.data.debtData?.disbursementDate),
      interestStartDate: formatDateToInt(this.data.debtData?.interestStartDate),
      maturityDate: formatDateToInt(this.data.debtData?.maturityDate),
      amortizationStartDate: formatDateToInt(this.data.debtData?.fechai),

      // Información financiera
      currencyId: this.data.debtData?.currencyId || '',
      nominal: cleanNumeric(this.data.debtData?.nominal),
      amortizationRate: cleanNumeric(this.data.debtData?.amortizationRate),
      amortizationStartPayment: this.data.debtData?.amortizationStartPayment ?? null,
      periodsId: this.data.debtData?.periodsId ?? null,

      // Información de tasas
      rateClassificationId: this.data.debtData?.rateClassificationId ?? null,
      fixedRatePercentage: cleanNumeric(this.data.debtData?.fixedRatePercentage),
      referenceRate: this.data.debtData?.referenceRate || '',
      rateAdjustment: cleanNumeric(this.data.debtData?.rateAdjustment),
      applicableMargin: cleanNumeric(this.data.debtData?.applicableMargin),
      others: cleanNumeric(this.data.debtData?.otherRateParams),

      // Excepciones
      applyAmortizationException: this.data.debtData?.applyAmortizationException || false,
      amortizationExceptions: amortizationExceptions,

      // Configuración adicional
      operationTrm: cleanNumeric(this.data.debtData?.operationTrm),
      basisId: this.data.debtData?.basisId ?? null,
      rateTypeId: this.data.debtData?.rateTypeId || '',
      rateExpressionTypeId: this.data.debtData?.tipoe || '',
      amortizationMethodId: this.data.debtData?.amortizationMethodId ?? null,
      amortizationTypeId: this.data.debtData?.tipoa || '',
      roundingTypeId: this.data.debtData?.roundingTypeId ?? null,
      interestStructureId: this.data.debtData?.periodicidadIntereses ?? null,

      // Campos descriptivos
      portfolio: this.data.debtData?.portfolio || '',
      project: this.data.debtData?.project || '',
      assignment: this.data.debtData?.assignment || '',
      internalReference: this.data.debtData?.internalReference || '',
      characteristics: this.data.debtData?.features || '',

      // ========== CAMPOS ADICIONALES (TRM) - NUEVOS ==========
      subsidiaryGuarantorId: this.data.debtData?.subsidiaryGuarantorId ?? null,
      merchant: this.data.debtData?.merchant || '',
      valuationCategory: this.data.debtData?.valuationCategory || '',
      externalReference: this.data.debtData?.externalReference || '',
      structuringCost: cleanNumeric(this.data.debtData?.structuringCost),
      // ========== FIN CAMPOS ADICIONALES (TRM) ==========


      registeredBy: this.data.debtData?.registeredBy || '',
      schedules: mappedSchedules
    };

    return debtRequest;
  }

  cerrar(): void {
    const result = { action: 'cancel' };

    if (this.dialogRef) {
      // Si se abrió con MatDialog
      this.dialogRef.close(result);
    } else if (this.activeModal) {
      // Si se abrió con NgbModal
      this.activeModal.dismiss(result);
    } else {
      // Si se usa como componente hijo con @Input/@Output
      this.close.emit(result);
      this.modalService.dismissAll();
    }
  }
  getTotalDeudaBancaria(): number {
    return this.totalesAgregados?.totalDeudaBancaria || 0;
  }

  getTotalDeudaMes(): number {
    return this.totalesAgregados?.totalDeudaMes || 0;
  }

  getDeudaPorMoneda(): number {
    if (this.totalesAgregados?.deudaPorMoneda) {
      let total = 0;
      Object.values(this.totalesAgregados.deudaPorMoneda).forEach((moneda: any) => {
        Object.values(moneda).forEach((valor: any) => {
          total += valor || 0;
        });
      });
      return total;
    }
    return 0;
  }

  getDeudaPorInstrumento(): number {
    if (this.totalesAgregados?.deudaPorInstrumento) {
      let total = 0;
      Object.values(this.totalesAgregados.deudaPorInstrumento).forEach((valor: any) => {
        total += valor || 0;
      });
      return total;
    }
    return 0;
  }

  getTasaAntesCobertura(): number {
    return (this.totalesAgregados?.tasaAntesCobertura || 0) / 100;
  }

  getTasaDespuesCobertura(): number {
    return (this.totalesAgregados?.tasaDespuesCobertura || 0) / 100;
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  exportToExcel(): void {
    try {
      const headerData = [
        ['Cronograma de Pagos'],
        [],
        ['Operación', 'Atenea', 'Sociedad', this.headerData.sociedad, 'Acreedor', this.headerData.acreedor],
        ['Moneda', this.headerData.moneda, 'Nominal', this.headerData.nominal, 'Inicio Validez', this.formatHeaderDate(this.headerData.inicioValidez)],
        ['Tipo Tasa', this.headerData.tipoTasa, 'Tasa', this.headerData.tasa + '%', 'Vencimiento', this.formatHeaderDate(this.headerData.vencimiento)],
        ['Cobertura', 'SI/No', 'Saldo por pagar', this.headerData.saldoPorPagar],
        []
      ];

      // SOLO EXPORTAR LAS COLUMNAS VISIBLES
      const columnMapping: { [key: string]: string } = {
        'fecha': 'Fecha',
        'fecha_pago': 'Fecha de Pago',
        'nro_pago': 'Cuota',
        'moneda': 'Moneda',
        'saldo_inicial': 'Saldo Inicial',
        'saldo_final': 'Saldo Final',
        'nominal': 'Nominal',
        'prepagos': 'Prepagos',
        'amortizacion': 'Amortización',
        'intereses': 'Intereses',
        'tasa_interes': 'Tasa de Interés %',
        'tipo_tasa': 'Tipo de Tasa',
        'tasa_referencia': 'Tasa de Referencia',
        'fecha_tasa_variable': 'Fecha Tasa Variable',
        'tasa': 'Tasa %',
        'term_sofr_adj': 'Term SOFR Adj. %',
        'applicable_margin': 'Applicable Margin %',
        'cuota': 'Cuota Total',
        'garante_final': 'Garante Final',
        'seguros': 'Seguros'
      };

      // Usar solo las columnas visibles para el encabezado
      const tableHeaders = this.displayedColumns.map(col => columnMapping[col] || col);

      // Mapear solo los datos de las columnas visibles
      const tableData = this.dataSource.data.map(row => {
        return this.displayedColumns.map(col => {
          if (col === 'fecha' || col === 'fecha_pago' || col === 'fecha_tasa_variable') {
            return this.formatDateForExcel(row[col]);
          }
          return row[col] || '';
        });
      });

      const totalsData = [
        [],
        ['TOTALES'],
        ['Total Amortización', this.getTotalAmortization()],
        ['Total Intereses', this.getTotalInterest()],
        ['Total Cuotas', this.getTotalInstallment()],
        ['Total Prepagos', this.getTotalPrepayments()],
        [],
        ['RESUMEN DE DEUDA'],
        ['Total Deuda Bancaria', this.getTotalDeudaBancaria()],
        ['Total Deuda (Mes)', this.getTotalDeudaMes()],
        ['Deuda por moneda según plazo', this.getDeudaPorMoneda()],
        ['Deuda por instrumento', this.getDeudaPorInstrumento()],
        ['Tasa antes de cobertura', (this.totalesAgregados?.tasaAntesCobertura || 0) + '%'],
        ['Tasa después de cobertura', (this.totalesAgregados?.tasaDespuesCobertura || 0) + '%']
      ];

      const ws_data = [
        ...headerData,
        tableHeaders,
        ...tableData,
        ...totalsData
      ];

      const ws = XLSX.utils.aoa_to_sheet(ws_data);

      // Ajustar anchos de columna según las columnas visibles
      const colWidths = this.displayedColumns.map(() => ({ wch: 15 }));
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cronograma');

      const today = new Date();
      const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
      const fileName = `Cronograma_Deuda_${dateStr}.xlsx`;

      XLSX.writeFile(wb, fileName);

      Swal.fire({
        icon: 'success',
        title: 'Exportación exitosa',
        text: 'El cronograma se ha exportado correctamente a Excel',
        showConfirmButton: false,
        timer: 1500
      });

    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo exportar el cronograma a Excel'
      });
    }
  }

  private formatDateForExcel(date: Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  updateFinalGuarantor(element: any, value: any): void {
    const index = this.dataSource.data.indexOf(element);
    if (index >= 0 && index < this.schedules.length) {
      this.schedules[index].finalGuarantor = parseFloat(value) || 0;
    }
  }

  adicionarPrepago(){

  }
}
