import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from "sweetalert2";

// Servicios
import { DeudaService } from 'src/app/shared/services/deuda.service';
import { CalculosDeudaService } from 'src/app/shared/services/calculos-deuda.service';
import { TesoreriaService } from "../../../../../models/Tesoreria/tesoreria.service";
import { TokenService } from "../../../../../shared/services/token.service";

// Componentes
import { CronogramaComponent } from '../cronograma/cronograma.component';
import { ExcepcionComponent } from '../excepcion/excepcion.component';

// Modelos
import { Moneda } from "../../../../../models/Tesoreria/moneda";
import { OpcionesCombo } from "../../../../../models/Tesoreria/opcionesCombo";
import { Acreedor } from "../../../../../models/Tesoreria/acreedor";
import {
  DebtRequest,
  DebtScheduleRequest,
  MetodoAmortizacion,
  ClasificacionTasa,
} from 'src/app/models/Tesoreria/Deuda/models';

@Component({
  selector: 'app-registro-deuda',
  templateUrl: './registro-deuda.component.html',
  styleUrls: ['./registro-deuda.component.scss']
})
export class RegistroDeudaComponent implements OnInit, OnDestroy {

  @Input() modo: 'registrar' | 'editar' = 'registrar';
  @Output() close = new EventEmitter<boolean>();
  @Input() visible: boolean = false;
  @Input() objForm: any;
  @Input() objIntercompany: any;

  debtForm: FormGroup;
  isEditMode: boolean = false;
  debtId: string = '';
  loading: boolean = false;
  schedules: DebtScheduleRequest[] = [];
  private destroy$ = new Subject<void>();

  // Catálogos
  subsidiaries: any[] = [];
  creditors: any[] = [];
  counterparts: any[] = [];
  amortizationMethods: any[] = [];
  periods: any[] = [];
  basisOptions: any[] = [];
  rateTypes: any[] = [];
  rateClassifications: any[] = [];
  roundingTypes: any[] = [];
  rateTypeOptions: any[] = [];
  listCurrencies: any[] = [];
  listProductClasses: any[] = [];
  listLoanTypes: any[] = [];
  listLoanAmortizationTypes: any[]= [];

  listTasaNominal: any[] = [
    { codigo: 1, nombre: 'Tasa Nominal Anual', status: true },
    { codigo: 2, nombre: 'Tasa Efectiva Anual', status: true }
    /*{ codigo: 'TNA', nombre: 'Tasa Nominal Anual', status: true },
    { codigo: 'TEA', nombre: 'Tasa Efectiva Anual', status: true }*/
  ];

  excepcionesGuardadas: any[] = [];
  showVariableRateFields: boolean = false;
  exchangeRate: number = 1;

  totalesAgregados: any = {
    totalDeudaBancaria: 0,
    totalDeudaMes: 0,
    deudaPorMoneda: {},
    deudaPorInstrumento: {},
    tasaAntesCobertura: 0,
    tasaDespuesCobertura: 0
  };

  /*public listClaseProducto: any[] = [
    { id: "PBC", descripcion: "Préstamos bancarios corto plazo" },
    { id: "PBL", descripcion: "Préstamos bancarios largo plazo" },
    { id: "IPC", descripcion: "Préstamos intercompany corto plazo" },
    { id: "IPL", descripcion: "Préstamos intercompany largo plazo" },
    { id: "PAC", descripcion: "Pagarés corto plazo" },
    { id: "PAL", descripcion: "Pagarés largo plazo" },
    { id: "FIC", descripcion: "Financiamiento de importación corto plazo" },
    { id: "FIL", descripcion: "Financiamiento de importación largo plazo" },
    { id: "PCM", descripcion: "Papeles Comerciales" },
    { id: "LEA", descripcion: "Leasing" },
    { id: "EMI", descripcion: "Emisiones de Bonos" }
  ];*/

  /*public listTipoProducto: any[] = [
    { claseId: "PBC", descripcion: "Préstamo bancario corto plazo" },
    { claseId: "PBL", descripcion: "Sindicado" },
    { claseId: "PBL", descripcion: "Otro préstamo bancario a largo plazo" },
    { claseId: "IPC", descripcion: "Préstamos intercompany corto plazo" },
    { claseId: "IPL", descripcion: "Préstamos intercompany largo plazo" },
    { claseId: "PAC", descripcion: "Pagaré corto plazo" },
    { claseId: "PAL", descripcion: "Pagaré largo plazo" },
    { claseId: "FIC", descripcion: "Financiamiento de importación corto plazo" },
    { claseId: "FIL", descripcion: "Financiamiento de importación largo plazo" },
    { claseId: "PCM", descripcion: "Papel comercial" },
    { claseId: "LEA", descripcion: "Leasing" },
    { claseId: "EMI", descripcion: "Senior notes" },
    { claseId: "EMI", descripcion: "Emisión 2" },
    { claseId: "EMI", descripcion: "Prog I - Emisión 3" }
  ];*/

  loanAmortizationTypes = [
    { id: '01', name: 'Bullet' },
    { id: '02', name: 'Capital constante' },
    { id: '03', name: 'Capital variable' },
    { id: '04', name: 'Cuota constante' }
  ];

  loanRateExpressionTypes = [
    { id: 'TEA', name: 'TEA' },
    { id: 'TNA', name: 'TNA' }
  ];

  mostrarExcepcion: boolean = true;
  rateClassificationsOriginal: any[] | null = null;
  today: Date = new Date();

  public tiposFiltrados: any[] = [];
  public idTipoOC: string = "BON";
  public nombreTipoSeleccionado: string = "";

  initialProductClassId: number = 11;
  initialProductClassMapper: string = "EMI";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private deudaService: DeudaService,
    private calculosService: CalculosDeudaService,
    private tesoreriaService: TesoreriaService,
    private tokenService: TokenService,
    private modalService: NgbModal
  ) {
    this.debtForm = this.createForm();
  }

  ngOnInit(): void {
    //this.initialProductClassMapper = this.claseProductoMapper[this.initialProductClassId];
    this.initialProductClassMapper= this.claseProductoMapper[this.debtForm.get('idClaseProducto')?.value] || 'EMI';
    this.onClaseTipoChange(this.initialProductClassMapper); //('EMI');
    this.loadCatalogs();
    this.checkEditMode();
    this.checkEditModes();
    this.setupFormListeners();
    this.showVariableRateFields = false;
    //const claseInicial = this.claseProductoMapper[this.debtForm.get('idClaseProducto')?.value] || 'EMI';
    this.updateValidatorsByProductClass(this.initialProductClassMapper); //(claseInicial);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTipoOCChange(tipoId: any) {
    /*const tipo = this.listTipoProducto.find(x => x.t445_id === tipoId);
    this.nombreTipoSeleccionado = tipo ? tipo.t445_description : "";*/

    const claseProducto = this.claseProductoMapper[this.debtForm.get('idClaseProducto')?.value];

    if (!this.rateClassificationsOriginal) {
      this.rateClassificationsOriginal = [...this.rateClassifications];
    }

    if (['PCM', 'IPC', 'IPL', 'FIC', 'FIL', 'LEA'].includes(claseProducto)) {
      this.rateClassifications = this.rateClassifications
        .map((r: any) => ({
          id: r.id,
          name: r.name
        }))
        .filter((r: any) => r.name !== 'Variable');

      this.debtForm.get('rateClassification')?.disable();

    } else {
      console.log(this.rateClassifications);
      this.rateClassifications = [...this.rateClassificationsOriginal];
      this.debtForm.get('rateClassification')?.enable();

      console.log(this.rateClassifications);
      console.log(this.rateClassificationsOriginal);
    }

    this.onClaseTipoChange(tipoId.id);
    this.updateValidatorsByProductClass(claseProducto);
  }

  onClaseTipoChange(tipoId: any) {
    //this.tiposFiltrados = this.listTipoProducto.filter(x => x.claseId === tipoId);
    /*if (this.tiposFiltrados.length > 0) {
      this.debtForm.get("idTipoProducto")?.setValue(this.tiposFiltrados[0].descripcion);
    } else {
      this.debtForm.get("idTipoProducto")?.reset();
    }*/
  }

  private createForm(): FormGroup {
    return this.fb.group({
      subsidiaryDebtorId: [null],
      deudorDescripcion: [''],
      creditorType: ['SUBSIDIARY'],
      subsidiaryCreditorId: [null],
      counterpartCreditorId: [null],
      acreedorDescripcion: [''],

      idClaseProducto: [this.initialProductClassId], // ["EMI"],
      idTipoProducto: [""],
      productType:[""],
      fechaaceptacion: [''],

      fechai: [''],
      precio: [''],
      tasa: [''],
      tipoa: [''],
      tipoe: [''],

      loanTypeId: [null],
      validityStartDate: [null],
      disbursementDate: [null],
      interestStartDate: [null],
      maturityDate: [null],
      currencyId: [null],
      currencyDescripcion: [''],
      nominal: [null],
      amortizationRate: [null],
      amortizationStartPayment: [null],
      periodsId: [null],
      periodsDescripcion: [''],
      rateClassificationId: [null],
      rateClassificationDescripcion: [''],
      fixedRatePercentage: [null],
      referenceRate: [''],
      termSofrAdj: [null],
      applicableMargin: [null],
      otherRateParams: [null],
      applyAmortizationException: [false],
      operationTrm: [null],
      basisId: [null],
      basisDescripcion: [''],
      rateTypeId: [null],
      rateTypeDescripcion: [''],
      amortizationMethodId: [null],
      amortizationMethodDescripcion: [''],
      roundingTypeId: [null],
      roundingTypeDescripcion: [''],
      periodicidadIntereses: [null],
      // Campos adicionales - SIN validadores requeridos
      portfolio: [''],
      project: [''],
      assignment: [''],
      internalReference: [''],
      features: [''],
      registeredBy: [this.tokenService.getUserName() || '']
    });
  }

  private updateValidatorsByProductClass(claseProducto: string): void {

    this.clearAllValidators();

    // Validadores base que siempre aplican (solo campos antes de "Campos Adicionales")
    this.debtForm.get('idClaseProducto')?.setValidators([Validators.required]);
    //this.debtForm.get('idTipoProducto')?.setValidators([Validators.required]);
    this.debtForm.get('subsidiaryDebtorId')?.setValidators([Validators.required]);
    this.debtForm.get('loanTypeId')?.setValidators([Validators.required]);
    this.debtForm.get('validityStartDate')?.setValidators([Validators.required]);
    this.debtForm.get('maturityDate')?.setValidators([Validators.required]);
    this.debtForm.get('currencyId')?.setValidators([Validators.required]);
    this.debtForm.get('nominal')?.setValidators([Validators.required, Validators.min(0.01)]);
    this.debtForm.get('tipoa')?.setValidators([Validators.required]);
    this.debtForm.get('tipoe')?.setValidators([Validators.required]);
    this.debtForm.get('rateClassificationId')?.setValidators([Validators.required]);

    // Campos adicionales base (antes de la sección "Campos Adicionales")
    this.debtForm.get('operationTrm')?.setValidators([Validators.required]);
    this.debtForm.get('basisId')?.setValidators([Validators.required]);
    this.debtForm.get('rateTypeId')?.setValidators([Validators.required]);
    this.debtForm.get('amortizationMethodId')?.setValidators([Validators.required]);
    this.debtForm.get('roundingTypeId')?.setValidators([Validators.required]);
    this.debtForm.get('periodicidadIntereses')?.setValidators([Validators.required]);

    if (claseProducto !== 'PCM') {
      this.debtForm.get('subsidiaryCreditorId')?.setValidators([Validators.required]);
    }

    if (!['IPC', 'IPL', 'FIC', 'FIL'].includes(claseProducto)) {
      this.debtForm.get('disbursementDate')?.setValidators([Validators.required]);
    }

    if (!['IPL', 'IPC'].includes(claseProducto)) {
      this.debtForm.get('interestStartDate')?.setValidators([Validators.required]);
    }

    if (!['PCM', 'IPL', 'IPC', 'FIL', 'FIC'].includes(claseProducto)) {
      this.debtForm.get('fechai')?.setValidators([Validators.required]);
    }

    if (['FIL', 'FIC'].includes(claseProducto)) {
      this.debtForm.get('fechaaceptacion')?.setValidators([Validators.required]);
    }

    if (claseProducto === 'LEA') {
      this.debtForm.get('amortizationRate')?.setValidators([Validators.required, Validators.min(0)]);
    }

    if (claseProducto === 'PCM') {
      this.debtForm.get('precio')?.setValidators([Validators.required, Validators.min(0)]);
    }

    if (['PBC', 'PBL', 'PAC', 'PAL', 'EMI', 'LEA'].includes(claseProducto)) {
      this.debtForm.get('amortizationRate')?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      this.debtForm.get('amortizationStartPayment')?.setValidators([Validators.required, Validators.min(1)]);
      this.debtForm.get('periodsId')?.setValidators([Validators.required]);
    }

    this.onRateClassificationChange(this.debtForm.get('rateClassificationId')?.value);
    this.updateAllFieldsValidity();
  }

  private clearAllValidators(): void {
    const allFields = [
      'subsidiaryDebtorId', 'subsidiaryCreditorId', 'counterpartCreditorId',
      'loanTypeId', 'validityStartDate', 'disbursementDate', 'interestStartDate',
      'maturityDate', 'currencyId', 'nominal', 'amortizationRate',
      'amortizationStartPayment', 'periodsId', 'rateClassificationId',
      'fixedRatePercentage', 'referenceRate', 'termSofrAdj', 'applicableMargin',
      'otherRateParams', 'applyAmortizationException', 'operationTrm', 'basisId',
      'rateTypeId', 'amortizationMethodId', 'roundingTypeId', 'periodicidadIntereses',
      'portfolio', 'project', 'assignment', 'internalReference', 'features',
      'fechai', 'fechaaceptacion', 'precio', 'tipoa', 'tipoe',
      'idClaseProducto', 'idTipoProducto'
    ];

    allFields.forEach(field => {
      this.debtForm.get(field)?.clearValidators();
      this.debtForm.get(field)?.setErrors(null);
    });
  }

  private updateAllFieldsValidity(): void {
    Object.keys(this.debtForm.controls).forEach(key => {
      this.debtForm.get(key)?.updateValueAndValidity({ emitEvent: false });
    });
  }

  private setupFormListeners(): void {
    this.debtForm.get('idClaseProducto')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value) {
          console.log("setupFormListeners", this.claseProductoMapper[value])
          this.updateValidatorsByProductClass(this.claseProductoMapper[value]);
        }
      });

    this.debtForm.get('creditorType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value === 'COUNTERPART') {
          this.debtForm.get('counterpartCreditorId')?.setValidators(Validators.required);
          this.debtForm.get('subsidiaryCreditorId')?.clearValidators();
          this.debtForm.get('subsidiaryCreditorId')?.setValue(null);
        } else {
          const claseProducto = this.claseProductoMapper[this.debtForm.get('idClaseProducto')?.value];
          if (claseProducto !== 'PCM') {
            this.debtForm.get('subsidiaryCreditorId')?.setValidators(Validators.required);
          }
          this.debtForm.get('counterpartCreditorId')?.clearValidators();
          this.debtForm.get('counterpartCreditorId')?.setValue(null);
        }

        this.debtForm.get('counterpartCreditorId')?.updateValueAndValidity();
        this.debtForm.get('subsidiaryCreditorId')?.updateValueAndValidity();
      });

    this.debtForm.get('creditorType')?.setValue('SUBSIDIARY');

    // Listener para cambios en rateClassificationId
    this.debtForm.get('rateClassificationId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.onRateClassificationChange(value);
      });

    // Listener para tipoa (tipo de amortización)
    this.debtForm.get('tipoa')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.onAmortizationTypeChange(value);
      });

    this.debtForm.get('disbursementDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.validateDates());

    this.debtForm.get('maturityDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.validateDates());

    this.debtForm.get('interestStartDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.validateDates());

    this.debtForm.get('operationTrm')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value) this.exchangeRate = value;
      });
  }

  onRateClassificationChange(value: number | string): void {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    this.showVariableRateFields = (numValue === ClasificacionTasa.VARIABLE || numValue === 2);
    this.updateRateValidators(numValue);
  }

  onAmortizationTypeChange(value: any): void {
    console.log("Valor de Tipo AMortizacion: ",value)
    if (value.id == '01') {
      this.mostrarExcepcion = false;
    } else {
      this.mostrarExcepcion = true;
    }

    const claseProducto = this.claseProductoMapper[this.debtForm.get('idClaseProducto')?.value];

    if (value.id === '01') {
      this.debtForm.get('amortizationRate')?.clearValidators();
      this.debtForm.get('amortizationStartPayment')?.clearValidators();
      this.debtForm.get('applyAmortizationException')?.setValue(false);
      this.debtForm.get('applyAmortizationException')?.disable();
    } else {
      // Solo aplicar validadores si el campo está visible para esa clase de producto
      if (['PBC', 'PBL', 'PAC', 'PAL', 'EMI', 'LEA'].includes(claseProducto)) {
        this.debtForm.get('amortizationRate')?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
        this.debtForm.get('amortizationStartPayment')?.setValidators([Validators.required, Validators.min(1)]);
      }
      this.debtForm.get('applyAmortizationException')?.enable();
    }

    this.debtForm.get('amortizationRate')?.updateValueAndValidity();
    this.debtForm.get('amortizationStartPayment')?.updateValueAndValidity();
  }

  private updateRateValidators(rateClassificationId: number): void {
    const fixedRateControl = this.debtForm.get('fixedRatePercentage');
    const termSofrAdjControl = this.debtForm.get('termSofrAdj');
    const applicableMarginControl = this.debtForm.get('applicableMargin');

    if (rateClassificationId === ClasificacionTasa.FIJA || rateClassificationId === 1) {
      fixedRateControl?.setValidators([Validators.required, Validators.min(0)]);
      termSofrAdjControl?.clearValidators();
      applicableMarginControl?.clearValidators();
      termSofrAdjControl?.setValue(null);
      applicableMarginControl?.setValue(null);
    } else {
      fixedRateControl?.clearValidators();
      termSofrAdjControl?.setValidators([Validators.required, Validators.min(0)]);
      applicableMarginControl?.setValidators([Validators.required]);
      fixedRateControl?.setValue(null);
    }

    fixedRateControl?.updateValueAndValidity();
    termSofrAdjControl?.updateValueAndValidity();
    applicableMarginControl?.updateValueAndValidity();
  }

  private loadCatalogs(): void {
    this.loading = true;

    forkJoin({
      monedas: this.tesoreriaService.getListaMonedas(),
      basis: this.tesoreriaService.getListaCombo(3),
      periods: this.tesoreriaService.getListaCombo(4),
      interestRateType: this.tesoreriaService.getListaCombo(5),
      acreedores: this.tesoreriaService.getListaAcreedor(),
      contrapartes: this.tesoreriaService.getListaCombo(7),
      rateClassification: this.tesoreriaService.getListaCombo(9),
      loanType: this.tesoreriaService.getListaCombo(18), //(10),
      amortizationMethod: this.tesoreriaService.getListaCombo(11),
      roundingType: this.tesoreriaService.getListaCombo(12),
      interestStructure: this.tesoreriaService.getListaCombo(13),
      classesProduct: this.tesoreriaService.getListaCombo(15),
      loanAmortizationTypes: this.tesoreriaService.getListaCombo(16)
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {

        this.listCurrencies = result.monedas
          .filter((m: Moneda) => m.t064Status === true)
          .map((m: Moneda) => ({
            id: m.t064Id,
            name: `${m.t064Description} (${m.t064Id})`
          }));

        this.basisOptions = result.basis.map((b: OpcionesCombo) => ({
          id: b.id_combo,
          name: b.descripcion_combo
        }));

        this.periods = result.periods.map((p: OpcionesCombo) => ({
          id: p.id_combo,
          name: p.descripcion_combo
        }));

        this.rateTypes = result.interestRateType.map((i: OpcionesCombo) => ({
          id: i.id_combo,
          name: i.descripcion_combo
        }));

        this.subsidiaries = result.acreedores[0].map((a: Acreedor) => ({
          id: a.id,
          name: a.description
        }));
        this.creditors = [...this.subsidiaries];

        this.counterparts = result.contrapartes.map((c: OpcionesCombo) => ({
          id: c.id_combo,
          name: c.descripcion_combo
        }));

        this.rateClassifications = result.rateClassification.map((r: OpcionesCombo) => ({
          id: r.id_combo,
          name: r.descripcion_combo
        }));

        this.listLoanTypes = result.loanType.map((l: OpcionesCombo) => ({
          id: l.id_combo,
          name: l.descripcion_combo
        }));

        this.amortizationMethods = result.amortizationMethod.map((am: OpcionesCombo) => ({
          id: am.id_combo,
          name: am.descripcion_combo
        }));

        this.roundingTypes = result.roundingType.map((rt: OpcionesCombo) => ({
          id: rt.id_combo,
          name: rt.descripcion_combo
        }));

        this.rateTypeOptions = result.interestStructure.map((is: OpcionesCombo) => ({
          codigo: is.id_combo,
          nombre: is.descripcion_combo
        }));

        this.listProductClasses = result.classesProduct.map((classProduct: OpcionesCombo) => ({
          codigo: classProduct.id_combo,
          name: classProduct.descripcion_combo
        }));

        this.listLoanAmortizationTypes = result.loanAmortizationTypes.map((loanAmortizationType: OpcionesCombo) => ({
          codigo: loanAmortizationType.id_combo,
          name: loanAmortizationType.descripcion_combo
        }));

        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al cargar catálogos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los catálogos. Por favor, intente nuevamente.'
        });
      }
    });
  }

  private checkEditMode(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.debtId = params['id'];
        this.loadDebtData(this.debtId);
      }
    });
  }

  private checkEditModes(): void {
    if (this.objForm) {
      const debtId = this.objForm.debtId || this.objForm.id || this.objForm;

      if (debtId) {
        this.isEditMode = true;
        this.debtId = typeof debtId === 'string' ? debtId : debtId.toString();
        this.loadDebtData(this.debtId);
      }
    }
  }

  private loadDebtData(id: string): void {
    this.loading = true;

    this.deudaService.obtenerDeuda(id).subscribe({
      next: (response: any) => {
        this.populateForm(response);

        // Si hay schedules, guardarlos
        if (response.schedules && response.schedules.length > 0) {
          this.schedules = response.schedules.map((schedule: any) =>
            this.mapScheduleFromBackend(schedule)
          );
        }

        // Si hay excepciones, guardarlas
        if (response.amortizationExceptions && response.amortizationExceptions.length > 0) {
          this.excepcionesGuardadas = response.amortizationExceptions.map((exc: any) => ({
            cuota: exc.cuotaExc,
            tasa: exc.amortizationRate,
            resultado: exc.resultado
          }));
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar deuda:', error);
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos de la deuda'
        });
      }
    });
  }

  private mapScheduleFromBackend(schedule: any): DebtScheduleRequest {
    return {
      seq: schedule.id,
      paymentNumber: schedule.paymentNumber,
      periodDate: schedule.calculationDate,
      paymentDate: schedule.paymentDate,
      currency: this.debtForm.get('currencyId')?.value || '',
      nominalOpening: schedule.initialBalance,
      nominalClosing: schedule.finalBalance,
      nominal: schedule.initialBalance,
      amortizationPrinc: schedule.amortization,
      interestPaid: schedule.interest,
      rate: schedule.appliedRate,
      rateType: schedule.rateType,
      referenceRate: schedule.referenceRate,
      variableRateDate: schedule.variableRateDate,
      interestRate: schedule.interestRate,
      termSofrAdj: schedule.termSofrAdj,
      applicableMargin: schedule.applicableMargin,
      fee: schedule.installment,
      finalGuarantor: schedule.finalGuarantor,
      insurance: schedule.insurance,
      provider: schedule.provider,
      acceptanceDate: schedule.acceptanceDate,
      fees: schedule.fees,
      status: schedule.status,
      registeredBy: schedule.registeredBy
    };
  }

  private populateForm(debt: any): void {
    const formatDateForInput = (dateNum: number) => {
      if (!dateNum) return null;
      const str = dateNum.toString();
      const year = str.substring(0, 4);
      const month = str.substring(4, 6);
      const day = str.substring(6, 8);
      return `${year}-${month}-${day}`;
    };

    let creditorType = 'SUBSIDIARY';
    if (debt.counterpartCreditorId && !debt.subsidiaryCreditorId) {
      creditorType = 'COUNTERPART';
    }

    let subsidiaryCreditorId = null;
    let counterpartCreditorId = null;

    if (creditorType === 'SUBSIDIARY') {
      subsidiaryCreditorId = debt.subsidiaryCreditorId;
      counterpartCreditorId = null;
    } else if (creditorType === 'COUNTERPART') {
      counterpartCreditorId = debt.counterpartCreditorId;
      subsidiaryCreditorId = null;
    }

    this.debtForm.patchValue({
      subsidiaryDebtorId: debt.subsidiaryDebtorId,
      creditorType: creditorType,
      subsidiaryCreditorId: debt.subsidiaryCreditorId,
      counterpartCreditorId: debt.counterpartCreditorId,
      loanTypeId: debt.loanTypeId,
      validityStartDate: formatDateForInput(debt.validityStartDate),
      disbursementDate: formatDateForInput(debt.disbursementDate),
      interestStartDate: formatDateForInput(debt.interestStartDate),
      maturityDate: formatDateForInput(debt.maturityDate),
      currencyId: debt.currencyId,
      nominal: debt.nominal,
      amortizationRate: debt.amortizationRate,
      amortizationStartPayment: debt.amortizationStartPayment,
      periodsId: debt.periodsId,
      rateClassificationId: debt.rateClassificationId,
      fixedRatePercentage: debt.fixedRatePercentage,
      referenceRate: debt.referenceRate,
      termSofrAdj: debt.termSofrAdj,
      applicableMargin: debt.applicableMargin,
      otherRateParams: debt.others,
      applyAmortizationException: debt.applyAmortizationException || false,
      operationTrm: debt.operationTrm,
      basisId: debt.basisId,
      rateTypeId: debt.rateTypeId,
      amortizationMethodId: debt.amortizationMethodId,
      roundingTypeId: debt.roundingTypeId,
      periodicidadIntereses: debt.interestStructureId,
      portfolio: debt.portfolio,
      project: debt.project,
      assignment: debt.assignment,
      internalReference: debt.internalReference,
      features: debt.characteristics,
      registeredBy: debt.registeredBy
    });

    this.updateAuxiliaryDescriptions();
  }

  private updateAuxiliaryDescriptions(): void {
    const formValue = this.debtForm.value;

    if (formValue.subsidiaryDebtorId) {
      const deudor = this.subsidiaries.find(s => s.id === formValue.subsidiaryDebtorId);
      if (deudor) this.debtForm.patchValue({ deudorDescripcion: deudor.name });
    }

    if (formValue.creditorType === 'SUBSIDIARY' && formValue.subsidiaryCreditorId) {
      const acreedor = this.creditors.find(c => c.id === formValue.subsidiaryCreditorId);
      if (acreedor) this.debtForm.patchValue({ acreedorDescripcion: acreedor.name });
    } else if (formValue.creditorType === 'COUNTERPART' && formValue.counterpartCreditorId) {
      const contraparte = this.counterparts.find(c => c.id === formValue.counterpartCreditorId);
      if (contraparte) this.debtForm.patchValue({ acreedorDescripcion: contraparte.name });
    }
  }

  generateSchedule(): void {
    if (!this.validateFormBeforeGenerate()) {
      return;
    }

    const formValue = this.prepareDataForCalculation();
    this.schedules = this.calculateSchedule(formValue);

    this.totalesAgregados = this.calcularTotalesAgregados();
    this.openScheduleDialog();
  }

  private calculateSchedule(deudaData: any): DebtScheduleRequest[] {
    // Validación inicial
    let nominal = this.extractNumericValue(deudaData.nominal);
    if (!nominal || nominal <= 0) {
      console.error('Nominal inválido:', nominal);
      return [];
    }

    // Extraer valores necesarios
    const claseProducto = deudaData.idClaseProducto;
    const amortizationRate = parseFloat(deudaData.amortizationRate) || 20;
    const amortizationStartPayment = parseInt(deudaData.amortizationStartPayment) || 1;
    const periodsId = parseInt(deudaData.periodsId);
    const basisId = parseInt(deudaData.basisId) || 360;
    const rateClassificationId = parseInt(deudaData.rateClassificationId);
    const amortizationMethodId = parseInt(deudaData.amortizationMethodId);
    const roundingTypeId = parseInt(deudaData.roundingTypeId);
    const currencyId = deudaData.currencyId;
    const rateTypeId = deudaData.rateTypeId || 'TEA';

    // DETERMINAR TIPO DE AMORTIZACIÓN SEGÚN CLASE DE PRODUCTO
    let tipoAmortizacion = 'CAPCONST';

    // Primero verificar por clase de producto
    if (['IPC', 'IPL', 'FIC', 'FIL'].includes(claseProducto)) {
      tipoAmortizacion = 'BULLET';
    } else if (claseProducto === 'PCM') {
      tipoAmortizacion = 'CUOTACONST';
    } else if (claseProducto === 'LEA') {
      tipoAmortizacion = 'CUOTACONST';
    } else {
      // Para otros productos (PBC, PBL, PAC, PAL, EMI) usar el tipo seleccionado
      if (deudaData.tipoa) {
        if (deudaData.tipoa === '01') tipoAmortizacion = 'BULLET';
        else if (deudaData.tipoa === '02') tipoAmortizacion = 'CAPCONST';
        else if (deudaData.tipoa === '03') tipoAmortizacion = 'CAPVAR';
        else if (deudaData.tipoa === '04') tipoAmortizacion = 'CUOTACONST';
      } else if (amortizationMethodId) {
        if (amortizationMethodId === 1 || amortizationMethodId === MetodoAmortizacion.LINEAL) {
          tipoAmortizacion = 'CAPCONST';
        } else if (amortizationMethodId === 2 || amortizationMethodId === MetodoAmortizacion.FRANCES) {
          tipoAmortizacion = 'CUOTACONST';
        } else if (amortizationMethodId === 3 || amortizationMethodId === MetodoAmortizacion.BULLET) {
          tipoAmortizacion = 'BULLET';
        }
      }
    }

    // Calcular tasa aplicable
    let tasaFija = 0;
    let tasaReferencia = 0;
    let termSofrAdj = 0;
    let applicableMargin = 0;
    let tipoTasa = 'FIJA';

    if (rateClassificationId === ClasificacionTasa.FIJA || rateClassificationId === 1) {
      tasaFija = parseFloat(deudaData.fixedRatePercentage) || 0;
      tipoTasa = 'FIJA';
    } else {
      tasaReferencia = parseFloat(deudaData.referenceRate) || 0;
      termSofrAdj = parseFloat(deudaData.termSofrAdj) || 0;
      applicableMargin = parseFloat(deudaData.applicableMargin) || 0;
      tasaFija = tasaReferencia + termSofrAdj + applicableMargin;
      tipoTasa = 'VARIABLE';
    }

    // Fechas
    const fechaDesembolso = this.parseDate(deudaData.disbursementDate);
    const fechaVencimiento = this.parseDate(deudaData.maturityDate);
    const fechaInicioIntereses = this.parseDate(deudaData.interestStartDate);

    // Calcular número de cuotas usando el servicio
    const numCuotas = this.calculosService.calcularNumeroCuotas(
      fechaDesembolso,
      fechaVencimiento,
      periodsId
    );

    if (numCuotas <= 0) {
      console.error('Número de períodos inválido');
      return [];
    }

    // Preparar parámetros para el servicio
    const parametros = {
      nominal: nominal,
      numCuotas: numCuotas,
      cuotaInicioAmortizacion: amortizationStartPayment,
      fechaDesembolso: fechaDesembolso,
      fechaInicioIntereses: fechaInicioIntereses,
      periodicidad: periodsId,
      base: basisId,
      currencyId: currencyId,
      rateTypeId: rateTypeId,
      tasaFija: tasaFija,
      tipoTasa: tipoTasa,
      tasaReferencia: tasaReferencia,
      termSofrAdj: termSofrAdj,
      applicableMargin: applicableMargin,
      amortizationRate: amortizationRate,
      excepciones: this.excepcionesGuardadas,
      registeredBy: deudaData.registeredBy || ''
    };

    // USAR EL SERVICIO según el tipo de amortización
    let schedulesFromService: any[] = [];

    if (tipoAmortizacion === 'BULLET') {
      schedulesFromService = this.calculosService.calcularBullet(parametros);
    } else if (tipoAmortizacion === 'CAPCONST') {
      schedulesFromService = this.calculosService.calcularCapitalConstante(parametros);
    } else if (tipoAmortizacion === 'CAPVAR') {
      schedulesFromService = this.calculosService.calcularCapitalVariable(parametros);
    } else if (tipoAmortizacion === 'CUOTACONST') {
      schedulesFromService = this.calculosService.calcularCuotaConstante(parametros);
    }

    // MANEJO ESPECIAL PARA LEASING - Considerar portes
    if (claseProducto === 'LEA') {
      const portes = parseFloat(deudaData.amortizationRate) || 0;

      schedulesFromService.forEach((item: any) => {
        const cuotaTotal = item.fee || 0;
        const interes = item.interestPaid || 0;
        item.amortizationPrinc = cuotaTotal - interes - portes;
        item.nominalClosing = Math.max(0, item.nominalOpening - item.amortizationPrinc);
      });
    }

    // Convertir la respuesta del servicio al formato DebtScheduleRequest
    const schedules: DebtScheduleRequest[] = schedulesFromService.map((item, index) => {
      // Aplicar redondeo usando el servicio
      const nominalOpening = this.calculosService.aplicarRedondeo(item.nominalOpening, roundingTypeId);
      const nominalClosing = this.calculosService.aplicarRedondeo(item.nominalClosing, roundingTypeId);
      const amortizationPrinc = this.calculosService.aplicarRedondeo(item.amortizationPrinc, roundingTypeId);
      const interestPaid = this.calculosService.aplicarRedondeo(item.interestPaid, roundingTypeId);
      const fee = this.calculosService.aplicarRedondeo(item.fee, roundingTypeId);

      // CREAR OBJETO BASE CON CAMPOS COMUNES
      let scheduleData: DebtScheduleRequest = {
        seq: index + 1,
        paymentNumber: item.paymentNumber,
        currency: item.currency,
        nominalOpening: nominalOpening,
        nominalClosing: nominalClosing,
        nominal: nominal,
        amortizationPrinc: amortizationPrinc,
        interestPaid: interestPaid,
        fee: fee,
        rate: item.rate,
        status: true,
        registeredBy: parametros.registeredBy
      };

      // AGREGAR CAMPOS SEGÚN CLASE DE PRODUCTO

      // Fechas - No para PCM
      if (claseProducto !== 'PCM') {
        scheduleData.periodDate = item.periodDate;
        scheduleData.paymentDate = item.paymentDate;
      }

      // Campos de tasa variable - Solo para PBC, PBL, PAC, PAL, EMI
      if (['PBC', 'PBL', 'PAC', 'PAL', 'EMI'].includes(claseProducto)) {
        scheduleData.rateType = rateTypeId;
        scheduleData.referenceRate = item.referenceRate || deudaData.referenceRate || '';
        scheduleData.variableRateDate = tipoTasa === 'VARIABLE' ? item.periodDate : null;
        scheduleData.interestRate = item.interestRate || item.rate;
        scheduleData.termSofrAdj = item.termSofrAdj;
        scheduleData.applicableMargin = item.applicableMargin;
      }

      // Tasa simple para IPC, IPL
      if (['IPC', 'IPL'].includes(claseProducto)) {
        scheduleData.rateType = rateTypeId;
        scheduleData.interestRate = item.interestRate || item.rate;
      }

      // Para FIC, FIL - solo tasa básica
      if (['FIC', 'FIL'].includes(claseProducto)) {
        scheduleData.interestRate = item.interestRate || item.rate;
      }

      // Garante final - Para todos excepto FIC, FIL, PCM
      if (!['FIC', 'FIL', 'PCM'].includes(claseProducto)) {
        scheduleData.finalGuarantor = item.finalGuarantor || 0;
      }

      // Prepagos - solo si existen
      if (item.prepayment && item.prepayment > 0) {
        scheduleData.prepayment = item.prepayment;
      }

      // Seguros - Solo para LEA
      if (claseProducto === 'LEA') {
        scheduleData.insurance = item.insurance || 0;
      }

      return scheduleData;
    });

    const validacion = this.calculosService.validarCoherencia(schedulesFromService, nominal);
    if (!validacion.esValido) {
      console.warn('Advertencias en el cálculo:', validacion.errores);

      if (schedules.length > 0) {
        const lastSchedule = schedules[schedules.length - 1];
        if (lastSchedule.nominalClosing && lastSchedule.nominalClosing > 0 && lastSchedule.nominalClosing <= 1) {
          lastSchedule.amortizationPrinc = this.calculosService.aplicarRedondeo(
            (lastSchedule.amortizationPrinc || 0) + lastSchedule.nominalClosing,
            roundingTypeId
          );
          lastSchedule.fee = this.calculosService.aplicarRedondeo(
            lastSchedule.amortizationPrinc + (lastSchedule.interestPaid || 0),
            roundingTypeId
          );
          lastSchedule.nominalClosing = 0;
        }
      }
    }

    return schedules;
  }

  save(): void {
    if (!this.debtForm.valid) {
      this.markFormGroupTouched(this.debtForm);
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    const debtData = this.prepareFormData();
    this.loading = true;

    const saveOperation = this.isEditMode
      ? this.deudaService.editarDeuda(this.debtId, debtData)
      : this.deudaService.registrarDeuda(debtData);

    saveOperation.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: this.isEditMode ? 'Deuda actualizada' : 'Deuda registrada',
          text: 'La operación se realizó exitosamente'
        }).then(() => {
          this.router.navigate(['/deuda/lista']);
        });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al guardar:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar la deuda. Por favor, intente nuevamente.'
        });
      }
    });
  }

  private prepareFormData(): DebtRequest {
    const formValue = this.debtForm.value;

    const formatDateToNumber = (date: any): number => {
      if (!date) return 0;
      if (typeof date === 'number') return date;
      const d = new Date(date);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return parseInt(`${year}${month}${day}`);
    };

    const cleanNumeric = (value: any): number | null => {
      if (!value && value !== 0) return null;
      if (typeof value === 'string') {
        return parseFloat(value.replace(/,/g, ''));
      }
      return parseFloat(value) || null;
    };

    let subsidiaryCreditorId = null;
    let counterpartCreditorId = null;
    const creditorType = formValue.creditorType;

    if (creditorType === 'SUBSIDIARY') {
      subsidiaryCreditorId = formValue.subsidiaryCreditorId;
      counterpartCreditorId = null;
    } else if (creditorType === 'COUNTERPART') {
      counterpartCreditorId = formValue.counterpartCreditorId;
      subsidiaryCreditorId = null;
    }

    const mappedSchedules: any[] = this.schedules.map(schedule => ({
      paymentNumber: schedule.paymentNumber ?? 0,
      calculationDate: schedule.periodDate ?? 0,
      paymentDate: schedule.paymentDate ?? 0,
      initialBalance: schedule.nominalOpening ?? 0,
      finalBalance: schedule.nominalClosing ?? 0,
      amortization: schedule.amortizationPrinc ?? 0,
      interest: schedule.interestPaid ?? 0,
      interestRate: schedule.interestRate ?? schedule.rate ?? 0,
      variableRateDate: schedule.variableRateDate || null,
      appliedRate: schedule.rate ?? 0,
      termSofrAdj: schedule.termSofrAdj ?? 0,
      applicableMargin: schedule.applicableMargin ?? 0,
      installment: schedule.fee ?? 0,
      finalGuarantor: String(schedule.finalGuarantor ?? ''),
      registeredBy: schedule.registeredBy ?? formValue.registeredBy ?? ''
    }));

    const debtRequest: DebtRequest = {
      // Campos de producto
      productClassId: formValue.idClaseProducto || '',
      productTypeId: formValue.idTipoProducto || '',

      // Entidades principales
      subsidiaryDebtorId: formValue.subsidiaryDebtorId,
      creditorType: creditorType,
      subsidiaryCreditorId: subsidiaryCreditorId,
      counterpartCreditorId: counterpartCreditorId,

      // Información del préstamo
      loanTypeId: formValue.loanTypeId,
      validityStartDate: formatDateToNumber(formValue.validityStartDate),
      disbursementDate: formatDateToNumber(formValue.disbursementDate),
      interestStartDate: formatDateToNumber(formValue.interestStartDate),
      maturityDate: formatDateToNumber(formValue.maturityDate),
      amortizationStartDate: formatDateToNumber(formValue.fechai),  // AGREGADO

      // Información financiera
      currencyId: formValue.currencyId,
      nominal: cleanNumeric(formValue.nominal) ?? 0,
      amortizationRate: cleanNumeric(formValue.amortizationRate) ?? 100,
      amortizationStartPayment: formValue.amortizationStartPayment ?? 1,
      periodsId: formValue.periodsId,

      // Información de tasas
      rateClassificationId: formValue.rateClassificationId,
      fixedRatePercentage: cleanNumeric(formValue.fixedRatePercentage),
      referenceRate: formValue.referenceRate || '',
      termSofrAdj: cleanNumeric(formValue.termSofrAdj),
      applicableMargin: cleanNumeric(formValue.applicableMargin),
      others: cleanNumeric(formValue.otherRateParams),

      // Excepciones
      applyAmortizationException: formValue.applyAmortizationException || false,
      amortizationExceptions: [],

      // Configuración adicional
      operationTrm: cleanNumeric(formValue.operationTrm),
      basisId: formValue.basisId,
      rateTypeId: formValue.rateTypeId || '',
      rateExpressionTypeId: formValue.tipoe || '',
      amortizationMethodId: formValue.amortizationMethodId,
      amortizationTypeId: formValue.tipoa || '',
      roundingTypeId: formValue.roundingTypeId,
      interestStructureId: formValue.periodicidadIntereses || null,
      portfolio: formValue.portfolio || '',
      project: formValue.project || '',
      assignment: formValue.assignment || '',
      internalReference: formValue.internalReference || '',
      characteristics: formValue.features || '',

      registeredBy: formValue.registeredBy || '',
      schedules: mappedSchedules
    };

    return debtRequest;
  }

  private prepareDataForCalculation(): any {
    return this.debtForm.value;
  }

  private extractNumericValue(value: any): number {
    if (!value && value !== 0) return 0;
    if (typeof value === 'string') {
      return parseFloat(value.replace(/,/g, ''));
    }
    return parseFloat(value) || 0;
  }

  private getMonthsPerPeriod(periodsId: number): number {
    const monthsMap: { [key: number]: number } = {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      6: 6,
      12: 12
    };
    return monthsMap[periodsId] || 3;
  }

  private monthsDiff(start: Date, end: Date): number {
    return (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
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

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  validateDates(): void {
    const disbursement = this.debtForm.get('disbursementDate')?.value;
    const maturity = this.debtForm.get('maturityDate')?.value;
    const interestStart = this.debtForm.get('interestStartDate')?.value;

    if (disbursement && maturity) {
      const disbursementDate = new Date(disbursement);
      const maturityDate = new Date(maturity);

      if (maturityDate <= disbursementDate) {
        this.debtForm.get('maturityDate')?.setErrors({ invalidDate: true });
        Swal.fire({
          icon: 'warning',
          title: 'Fecha inválida',
          text: 'La fecha de vencimiento debe ser posterior a la fecha de desembolso'
        });
      }
    }

    if (disbursement && interestStart) {
      const disbursementDate = new Date(disbursement);
      const interestStartDate = new Date(interestStart);

      if (interestStartDate < disbursementDate) {
        this.debtForm.get('interestStartDate')?.setErrors({ invalidDate: true });
        Swal.fire({
          icon: 'warning',
          title: 'Fecha inválida',
          text: 'La fecha de inicio de intereses no puede ser anterior a la fecha de desembolso'
        });
      }
    }
  }

  private validateFormBeforeGenerate(): boolean {
    const claseProducto = this.claseProductoMapper[this.debtForm.get('idClaseProducto')?.value];
    const tipoa = this.debtForm.get('tipoa')?.value;

    let requiredFields = [
      'idClaseProducto',
     // 'idTipoProducto',
      'subsidiaryDebtorId',
      'loanTypeId',
      'validityStartDate',
      'maturityDate',
      'currencyId',
      'nominal',
      'basisId',
      'rateClassificationId',
      'operationTrm',
      'amortizationMethodId',
      'roundingTypeId',
      'rateTypeId',
      'periodicidadIntereses',
      'tipoa',
      'tipoe'
    ];

    if (claseProducto !== 'PCM') {
      const creditorType = this.debtForm.get('creditorType')?.value;
      if (creditorType === 'SUBSIDIARY') {
        if (!this.debtForm.get('subsidiaryCreditorId')?.value) {
          Swal.fire({
            icon: 'warning',
            title: 'Acreedor requerido',
            text: 'Por favor seleccione una subsidiaria como acreedor'
          });
          return false;
        }
      } else if (creditorType === 'COUNTERPART') {
        if (!this.debtForm.get('counterpartCreditorId')?.value) {
          Swal.fire({
            icon: 'warning',
            title: 'Acreedor requerido',
            text: 'Por favor seleccione una contraparte como acreedor'
          });
          return false;
        }
      }
    }

    if (!['IPC', 'IPL', 'FIC', 'FIL'].includes(claseProducto)) {
      requiredFields.push('disbursementDate');
    }

    if (!['IPL', 'IPC'].includes(claseProducto)) {
      requiredFields.push('interestStartDate');
    }

    if (!['PCM', 'IPL', 'IPC', 'FIL', 'FIC'].includes(claseProducto)) {
      requiredFields.push('fechai');
    }

    if (['FIL', 'FIC'].includes(claseProducto)) {
      requiredFields.push('fechaaceptacion');
    }

    if (claseProducto === 'PCM') {
      requiredFields.push('precio');
    }

    if (['PBC', 'PBL', 'PAC', 'PAL', 'EMI', 'LEA'].includes(claseProducto)) {
      if (tipoa !== '01') {
        requiredFields.push('amortizationRate');
        requiredFields.push('amortizationStartPayment');
      }
      requiredFields.push('periodsId');
    }

    for (const field of requiredFields) {
      const value = this.debtForm.get(field)?.value;
      if (value === null || value === undefined || value === '') {
        Swal.fire({
          icon: 'warning',
          title: 'Campos requeridos',
          text: `Por favor complete el campo: ${this.getFieldLabel(field)}`
        });
        return false;
      }
    }

    const rateClassification = this.debtForm.get('rateClassificationId')?.value;
    if (rateClassification === ClasificacionTasa.FIJA || rateClassification === 1) {
      if (!this.debtForm.get('fixedRatePercentage')?.value) {
        Swal.fire({
          icon: 'warning',
          title: 'Tasa fija requerida',
          text: 'Por favor ingrese el porcentaje de tasa fija'
        });
        return false;
      }
    } else if (rateClassification === ClasificacionTasa.VARIABLE || rateClassification === 2) {
      if (!this.debtForm.get('applicableMargin')?.value || !this.debtForm.get('termSofrAdj')?.value) {
        Swal.fire({
          icon: 'warning',
          title: 'Datos de tasa variable requeridos',
          text: 'Por favor ingrese el margen aplicable y el ajuste SOFR'
        });
        return false;
      }
    }
    return true;
  }

  private validateFormBeforeGenerateSho(): boolean {
    const claseProducto = this.claseProductoMapper[this.debtForm.get('idClaseProducto')?.value];
    const tipoa = this.debtForm.get('tipoa')?.value;

    let requiredFields = [
      'idClaseProducto',
      'idTipoProducto',
      'subsidiaryDebtorId',
      'loanTypeId',
      'validityStartDate',
      'maturityDate',
      'currencyId',
      'nominal',
      'basisId',
      'rateClassificationId',
      'operationTrm',
      'amortizationMethodId',
      'roundingTypeId',
      'rateTypeId',
      'periodicidadIntereses',
      'tipoa',
      'tipoe'
    ];


    if (!['IPC', 'IPL', 'FIC', 'FIL'].includes(claseProducto)) {
      requiredFields.push('disbursementDate');
    }

    if (!['IPL', 'IPC'].includes(claseProducto)) {
      requiredFields.push('interestStartDate');
    }

    if (!['PCM', 'IPL', 'IPC', 'FIL', 'FIC'].includes(claseProducto)) {
      requiredFields.push('fechai');
    }

    if (['FIL', 'FIC'].includes(claseProducto)) {
      requiredFields.push('fechaaceptacion');
    }

    if (claseProducto === 'PCM') {
      requiredFields.push('precio');
    }

    if (['PBC', 'PBL', 'PAC', 'PAL', 'EMI', 'LEA'].includes(claseProducto)) {
      if (tipoa !== '01') {
        requiredFields.push('amortizationRate');
        requiredFields.push('amortizationStartPayment');
      }
      requiredFields.push('periodsId');
    }

    return true;
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      'subsidiaryDebtorId': 'Sociedad Deudora',
      'loanTypeId': 'Tipo de Préstamo',
      'disbursementDate': 'Fecha de Desembolso',
      'maturityDate': 'Fecha de Vencimiento',
      'currencyId': 'Moneda',
      'nominal': 'Nominal',
      'periodsId': 'Periodicidad',
      'basisId': 'Base',
      'amortizationRate': 'Tasa de Amortización',
      'amortizationStartPayment': 'Cuota Inicio Amortización',
      'rateClassificationId': 'Tipo de Tasa',
      'amortizationMethodId': 'Forma de Amortización',
      'roundingTypeId': 'Tipo de Redondeo',
      'rateTypeId': 'Tasa Nominal/Efectiva',
      'operationTrm': 'Operación TRM',
      'validityStartDate': 'Fecha Inicio Validez',
      'interestStartDate': 'Fecha Inicio Intereses',
      'idClaseProducto': 'Clase de Producto',
      'idTipoProducto': 'Tipo de Producto',
      'fechai': 'Fecha de Inicio Amortización',
      'fechaaceptacion': 'Fecha de Aceptación',
      'precio': 'Precio',
      'tipoa': 'Tipo de Amortización',
      'tipoe': 'Tipo de Expresión de Tasa',
      'periodicidadIntereses': 'Periodicidad (estructura de intereses)'
    };
    return labels[field] || field;
  }

  openScheduleDialog(): void {
    const formValue = this.debtForm.getRawValue();

    const deudorDescripcion = this.subsidiaries.find(s => s.id === formValue.subsidiaryDebtorId)?.name || '';
    const acreedorDescripcion = formValue.creditorType === 'SUBSIDIARY'
      ? this.creditors.find(c => c.id === formValue.subsidiaryCreditorId)?.name || ''
      : this.counterparts.find(c => c.id === formValue.counterpartCreditorId)?.name || '';
    const loanTypeDescripcion = this.listLoanTypes.find(l => l.id === formValue.loanTypeId)?.name || '';
    const rateClassificationDescripcion = this.rateClassifications.find(r => r.id === formValue.rateClassificationId)?.name || '';

    const dialogRef = this.dialog.open(CronogramaComponent, {
      width: '95%',
      maxWidth: '1400px',
      height: '90vh',
      data: {
        schedules: this.schedules,
        debtData: {
          ...formValue,
          deudorDescripcion: deudorDescripcion,
          acreedorDescripcion: acreedorDescripcion,
          loanTypeDescripcion: loanTypeDescripcion,
          rateClassificationDescripcion: rateClassificationDescripcion,
          currencyDescripcion: formValue.currencyId
        },
        isEditMode: this.isEditMode,
        totalesAgregados: this.totalesAgregados,
        isPreview: true,
        modo: this.isEditMode ? 'editar' : 'registrar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Cronograma confirmado:', result);
        if (result.schedules) {
          this.schedules = result.schedules;
        }
      }
    });
  }

  openExceptionDialog(): void {
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
        this.debtForm.patchValue({ applyAmortizationException: true });

        if (this.validateFormBeforeGenerateSho()) {
          const formValue = this.prepareDataForCalculation();
          this.schedules = this.calculateSchedule(formValue);
        }
      }
    });
  }

  private calculateTotalPeriods(): number {
    const startDate = this.debtForm.get('disbursementDate')?.value;
    const endDate = this.debtForm.get('maturityDate')?.value;
    const periodsId = this.debtForm.get('periodsId')?.value;

    if (!startDate || !endDate || !periodsId) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthsDifference = this.monthsDiff(start, end);
    const monthsPerPeriod = this.getMonthsPerPeriod(periodsId);

    return Math.ceil(monthsDifference / monthsPerPeriod);
  }

  private calcularTotalesAgregados(): any {
    const formValue = this.debtForm.value;
    const nominal = this.extractNumericValue(formValue.nominal) || 0;
    const currencyId = formValue.currencyId;

    const totalAmortizacion = this.schedules.reduce((sum, s) => sum + (s.amortizationPrinc || 0), 0);
    const totalInteres = this.schedules.reduce((sum, s) => sum + (s.interestPaid || 0), 0);
    const tasaPromedio = this.schedules.length > 0
      ? this.schedules.reduce((sum, s) => sum + (s.rate || 0), 0) / this.schedules.length
      : 0;

    const deudaPorMoneda = this.calcularDeudaPorMonedaYPlazo(formValue);
    const deudaPorInstrumento = this.calcularDeudaPorInstrumento(formValue);

    return {
      totalDeudaBancaria: nominal,
      totalAmortizacion: totalAmortizacion,
      totalInteres: totalInteres,
      totalDeudaMes: this.schedules[0]?.fee || 0,
      deudaPorMoneda: deudaPorMoneda,
      deudaPorInstrumento: deudaPorInstrumento,
      tasaAntesCobertura: tasaPromedio,
      tasaDespuesCobertura: tasaPromedio,
      numeroTotalCuotas: this.schedules.length,
      moneda: currencyId
    };
  }

  private calcularDeudaPorMonedaYPlazo(formValue: any): any {
    const nominal = this.extractNumericValue(formValue.nominal) || 0;
    const currencyId = formValue.currencyId || 'PEN';
    const maturityDate = this.parseDate(formValue.maturityDate);
    const disbursementDate = this.parseDate(formValue.disbursementDate);

    const plazoAnios = (maturityDate.getTime() - disbursementDate.getTime()) / (365 * 24 * 60 * 60 * 1000);

    let categoriaPlazo = '';
    if (plazoAnios <= 1) {
      categoriaPlazo = 'Corto Plazo (< 1 año)';
    } else if (plazoAnios <= 5) {
      categoriaPlazo = 'Mediano Plazo (1-5 años)';
    } else {
      categoriaPlazo = 'Largo Plazo (> 5 años)';
    }

    return {
      [currencyId]: {
        [categoriaPlazo]: nominal
      }
    };
  }

  private calcularDeudaPorInstrumento(formValue: any): any {
    const nominal = this.extractNumericValue(formValue.nominal) || 0;
    const loanTypeId = formValue.loanTypeId;

    const loanType = this.listLoanTypes.find(lt => lt.id === loanTypeId);
    const instrumentoNombre = loanType ? loanType.name : 'Otro';

    return {
      [instrumentoNombre]: nominal
    };
  }

  exportToExcel(): void {
    if (this.schedules.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'Primero debe generar el cronograma'
      });
      return;
    }

    console.warn('Exportación a Excel no implementada');
    Swal.fire({
      icon: 'info',
      title: 'No implementado',
      text: 'La exportación a Excel aún no está implementada'
    });
  }

  exportToPDF(): void {
    if (this.schedules.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'Primero debe generar el cronograma'
      });
      return;
    }

    console.warn('Exportación a PDF no implementada');
    Swal.fire({
      icon: 'info',
      title: 'No implementado',
      text: 'La exportación a PDF aún no está implementada'
    });
  }

  cancel(): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'Los cambios no guardados se perderán',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/deuda/lista']);
      }
    });
  }

  clearForm(): void {
    Swal.fire({
      title: '¿Limpiar formulario?',
      text: 'Se borrarán todos los datos ingresados',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.debtForm.reset({
          applyAmortizationException: false,
          creditorType: 'SUBSIDIARY',
          registeredBy: this.tokenService.getUserName() || '',
          idClaseProducto: this.initialProductClassId //'EMI'
        });

        this.schedules = [];
        this.excepcionesGuardadas = [];

        this.updateValidatorsByProductClass(this.claseProductoMapper[this.initialProductClassId]); //('EMI');

        Swal.fire({
          icon: 'success',
          title: 'Formulario limpiado',
          showConfirmButton: false,
          timer: 1000
        });
      }
    });
  }

  formatearValorNumeric(event: any, esConComas: boolean): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9.]/g, '');

    if (!value || value === '' || value === '.') {
      input.value = '';
      const fieldName = input.getAttribute('formControlName');
      if (fieldName) {
        this.debtForm.get(fieldName)?.setValue(null);
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
        this.debtForm.get(fieldName)?.setValue(numericValue, { emitEvent: false });

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

  formatearValor(event: any, esConComas: boolean, tipo?: string): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9.]/g, '');

    if (!value || value === '.') {
      input.value = '';
      const fieldName = input.getAttribute('formControlName');
      if (fieldName) {
        this.debtForm.get(fieldName)?.setValue(null);
      }
      return;
    }

    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    const fieldName = input.getAttribute('formControlName');
    if (!fieldName) return;

    const numericValue = parseFloat(value);

    if (!isNaN(numericValue)) {
      let finalValue = numericValue;

      if (tipo === 'porcentaje') {
        if (finalValue > 100) {
          finalValue = 100;
          value = '100';
        }
        if (finalValue < 0) {
          finalValue = 0;
          value = '0';
        }
      }

      this.debtForm.get(fieldName)?.setValue(finalValue, { emitEvent: false });

      if (esConComas) {
        const formatted = finalValue.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: parts[1]?.length || 0
        });
        input.value = formatted;
      } else {
        if (value.endsWith('.') || (parts[1] !== undefined)) {
          input.value = value;
        } else {
          input.value = finalValue.toString();
        }
      }
    }
  }

  generarExcepcion(): void {
    this.openExceptionDialog();
  }

  onSelectDeudor(event: any): void {
    const selected = this.subsidiaries.find(s => s.id === event);
    if (selected) {
      this.debtForm.patchValue({ deudorDescripcion: selected.name });
    }
  }

  onSelectAcreedor(event: any): void {
    const creditorType = this.debtForm.get('creditorType')?.value;

    if (creditorType === 'SUBSIDIARY') {
      const selected = this.creditors.find(c => c.id === event);
      if (selected) {
        this.debtForm.patchValue({ acreedorDescripcion: selected.name });
      }
    }
  }

  onSelectCounterpart(event: any): void {
    const selected = this.counterparts.find(c => c.id === event);
    if (selected) {
      this.debtForm.patchValue({ acreedorDescripcion: selected.name });
    }
  }

  onSelectLoanType(event: any): void {
    const selected = this.listLoanTypes.find(l => l.id === event);
    if (selected) {
      this.debtForm.patchValue({ loanTypeDescripcion: selected.name });
    }
  }

  onSelectCurrency(event: any): void {
    const selected = this.listCurrencies.find(c => c.id === event);
    if (selected) {
      this.debtForm.patchValue({ currencyDescripcion: selected.name });
    }
  }

  cerrar(): void {
    this.close.emit(true);
    this.modalService.dismissAll();
  }

   private claseProductoMapper: Record<number, string> = {
    1: 'PBC',
    2: 'PBL',
    3: 'IPC',
    4: 'IPL',
    5: 'PAC',
    6: 'PAL',
    7: 'FIC',
    8: 'FIL',
    9: 'PCM',
    10: 'LEA',
    11: 'EMI'
};


  mostrarCampo(campo: string): boolean {
    const clase = this.claseProductoMapper[this.debtForm.get('idClaseProducto')?.value];
    console.log("mostrarCampo", clase)
    const tipoa = this.debtForm.get('tipoa')?.value;
    const clasificacionTasa = this.debtForm.get('rateClassificationId')?.value;

    const mapa: Record<string, boolean> = {
      // Sección 1: Acreedor
      subsidiaryCreditorId: clase !== 'PCM',

      // Sección 2: Fechas
      disbursementDate: !['IPC', 'IPL', 'FIC', 'FIL'].includes(clase),
      interestStartDate: !['IPC', 'IPL'].includes(clase),
      fechai: !['PCM', 'IPC', 'IPL', 'FIL', 'FIC'].includes(clase),
      fechaaceptacion: ['FIL', 'FIC'].includes(clase),

      // Sección 2: Excepciones y tasas
      amortizationRate: ['PBC', 'PBL', 'PAC', 'PAL', 'EMI', 'LEA'].includes(clase),
      amortizationStartPayment: tipoa !== '01',
      applyAmortizationException: tipoa !== '01',
      periodsId: true,
      rateClassificationId: true,
      fixedRatePercentage: clasificacionTasa === 1,
      referenceRate: clasificacionTasa === 2,
      termSofrAdj: clasificacionTasa === 2,
      applicableMargin: clasificacionTasa === 2,
      otherRateParams: clasificacionTasa === 2,

      // Sección 2: Precio y portes
      precio: clase === 'PCM',
      portes: clase === 'LEA',

      // Sección 2: Prepago
      /*prepaymentDate: ['FIC','FIL','IPC','IPL','PCM','PBC','PBL','PAC','PAL','EMI'].includes(clase),
      prepaymentAmount: ['FIC','FIL','IPC','IPL','PCM','PBC','PBL','PAC','PAL','EMI'].includes(clase),
      prepaymentInstallmentNumber: ['FIC','FIL','IPC','IPL','PCM','PBC','PBL','PAC','PAL','EMI'].includes(clase),*/

      // Sección 3: Campos adicionales (todos visibles)
      operationTrm: true,
      basisId: true,
      rateTypeId: true,
      amortizationMethodId: true,
      roundingTypeId: true,
      periodicidadIntereses: true,
      portfolio: true,
      project: true,
      assignment: true,
      internalReference: true,
      features: true,
    };

    return mapa[campo] ?? true;
  }

}
