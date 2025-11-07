import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DebtResponse, DebtPageResponse, DebtDetail, DebtSearchRequest } from 'src/app/models/Tesoreria/Deuda/models';
import { TipoOC } from 'src/app/models/Tesoreria/tipoOC';
import { DeudaService } from 'src/app/shared/services/deuda.service';
import Swal from 'sweetalert2';
import { CronogramaComponent } from './cronograma/cronograma.component';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Acreedor } from 'src/app/models/Tesoreria/acreedor';
import { OpcionesCombo } from 'src/app/models/Tesoreria/opcionesCombo';
import { TesoreriaService } from 'src/app/models/Tesoreria/tesoreria.service';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-bonos',
  templateUrl: './bonos.component.html',
  styleUrls: ['./bonos.component.scss']
})
export class BonosComponent implements OnInit {

  // IMPORTS Y DECORADORES
  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Output() close = new EventEmitter<any>();
  @Input() data: any;
  @Input() visible: boolean = false;
  @Input() objForm: any;
  @Input() objIntercompany: any;

  // VARIABLES DE CONTEXTO Y ESTADO
  contextMenuPosition = { x: '0px', y: '0px' };
  public loading: boolean = false;
  public totalElements: number = 0;
  public pageSize: number = 100;
  public idTipoOC: string = "BON";
  public myModal: boolean = false;
  public modalWidth: number = 1400;

  // FUENTES DE DATOS Y TABLAS
  public dataSource: MatTableDataSource<DebtResponse>;
  public debts: DebtResponse[] = [];
  portafolioOpenDS: MatTableDataSource<any> = new MatTableDataSource();

  // LISTAS Y CATÁLOGOS ESTÁTICOS
  /*public listTipoOC: TipoOC[] = [
    { t445_id: "1", t445_description: "Préstamos bancarios corto plazo", t445_status: true } ,
    { t445_id: "PBL", t445_description: "Préstamos bancarios largo plazo", t445_status: true },
    { t445_id: "IPC", t445_description: "Préstamos intercompany corto plazo", t445_status: true },
    { t445_id: "IPL", t445_description: "Préstamos intercompany largo plazo", t445_status: true },
    { t445_id: "PAC", t445_description: "Pagarés corto plazo", t445_status: true },
    { t445_id: "PAL", t445_description: "Pagarés largo plazo", t445_status: true },
    { t445_id: "FIC", t445_description: "Financiamiento de importación corto plazo", t445_status: true },
    { t445_id: "FIL", t445_description: "Financiamiento de importación largo plazo", t445_status: true },
    { t445_id: "PCM", t445_description: "Papeles Comerciales", t445_status: true },
    { t445_id: "LEA", t445_description: "Leasing", t445_status: true },
    { t445_id: "EMI", t445_description: "Emisiones de Bonos", t445_status: true }
  ];*/


  // COLUMNAS DE LA TABLA
  displayedColumns: string[] = [
    'seleccionado',
    'claseProducto',
    'productType',
    'productName',
    'subsidiaryDebtorName',
    'subsidiaryCreditorName',
    'validityStartDate',
    'disbursementDate',
    'interestStartDate',
    'maturityDate',
    'currencyId',
    'nominal',
    'loanRateExpressionTypes',
    'rateClassificationId',
    'referenceRate',
    'rateAdjustment', //---> Ajuste de Tasa
    'applicableMargin', //--> Margen Aplicable
    'otherRateParams', //--> Otros Ajustes
    'fixedRatePercentage', //--> Tasa (porcentaje)
    'loanAmortizationTypes', //--> Tipo de Amortizacion
    //'amortizationRate', //--> tasa de amortizacion
    'periodsName', //--> Periodicidad de Pago
    'installmentPayable', //--> Cuota por Pagar
    'installmentPaymentDate', //--> Fecha de Pago de Cuota 
    'interestAmount', //--> Monto de Interes 
    'amortizationAmount', //--> Monto de Amortizacion 
    'installmentAmount', //-> Monto de Cuota
    // 'loanTypeName',
    //'amortizationStartPayment',
    //'rateClassificationName',
    //'rateTypeId',
    'operationTrm' //--> TRM Operacion
  ];

  // VARIABLES DE FILTRADO
  proveedorfiltrado: string[] = [];
  filtroProveedor: any[] = [];

  filtros: any = {
    subsidiaryDebtorName: [],
    subsidiaryCreditorName: [],
    loanTypeName: [],
    currencyId: [],
    rateClassificationName: [],
    periodsName: [],
    rateTypeId: [],
  };

  filtrosSeleccionados: any = {
    subsidiaryDebtorName: [],
    subsidiaryCreditorName: [],
    loanTypeName: [],
    currencyId: [],
    rateClassificationName: [],
    periodsName: [],
    rateTypeId: []
  };

  filterValue: any = {};
  textFilter: string = '';

  filtrosFecha: any={
    
    validityStartDateFrom: null,
    validityStartDateTo: null,
    disbursementDateFrom: null,
    disbursementDateTo: null,
    interestStartDateDesde: null, //-- no va
    interestStartDateHasta: null, //-- no va
    maturityDateFrom: null,
    maturityDateTo: null
  }

  // VARIABLES DE SELECCIÓN
  selectedDebtor: number | null = null;
  selectedCreditor: number | null = null;
  selectedLoanType: number | null = null;

  // DATOS DE ENTIDADES
  subsidiaries: any[] = [];
  listLoanTypes: any[] = [];
  listProducTypes: any[] = [];
  listProductClasses: any[]=[];

  // VARIABLES AUXILIARES Y CONTROL
  private destroy$ = new Subject<void>();
  objetoInitPadre: any;
  objIntecompanyEditar: any;
  objIntecompanyRegistrar: any;
  objIntecompany: any;


  onContextMenu(event: MouseEvent, item: any) {
    this.contextMenu.menuData = { item };
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { 'item': item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  constructor(
    private router: Router,
    private deudaService: DeudaService,
    private modalService: NgbModal,
    private tesoreriaService: TesoreriaService,
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.loadDebts();
    this.loadCatalogs();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getProductClassDescription(productClassId: number): string {
    if (!productClassId) return '-';
    const tipo = this.listProductClasses.find(t => Number(t.id) === productClassId);
    return tipo ? tipo.name : String(productClassId);
  }

  

  loadDebts(): void {
    this.loading = true;

    this.deudaService.listarDeudas().subscribe({
      next: (response: DebtPageResponse) => {
        this.debts = response.content.map(d => ({ ...d, seleccionado: false }));

        this.dataSource.data = this.debts;
        this.totalElements = response.totalElements;
        this.portafolioOpenDS = this.dataSource;

        this.filtros.subsidiaryDebtorName = Array.from(new Set(this.debts.map(d => d.subsidiaryDebtorName?.trim()).filter(Boolean)));
        this.filtros.subsidiaryCreditorName = Array.from(new Set(this.debts.map(d => d.subsidiaryCreditorName?.trim()).filter(Boolean)));
        this.filtros.loanTypeName = Array.from(new Set(this.debts.map(d => d.loanTypeName?.trim()).filter(Boolean)));
        this.filtros.currencyId = Array.from(new Set(this.debts.map(d => d.currencyId?.trim()).filter(Boolean)));
        this.filtros.rateClassificationName = Array.from(new Set(this.debts.map(d => d.rateClassificationName?.trim()).filter(Boolean)));
        this.filtros.periodsName = Array.from(new Set(this.debts.map(d => d.periodsName?.trim()).filter(Boolean)));
        this.filtros.rateTypeId = Array.from(new Set(this.debts.map(d => d.rateTypeId?.trim()).filter(Boolean)));

        this.getFormsValue();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las deudas'
        });
      }
    });
  }

  seleccionarFiltro(campo: string): void {
    this.filterValue[campo] = this.filtrosSeleccionados[campo];
    this.portafolioOpenDS.filter = JSON.stringify(this.filterValue);
    this.getFormsValue();
  }

  getFormsValue(): void {
    this.portafolioOpenDS.filterPredicate = (data, filter: string): boolean => {
      const search = JSON.parse(filter);
      let match = true;

      for (const campo in search) {
        const valores = search[campo];
        if (valores && valores.length > 0) {
          match = match && valores.some((v: string) => (data[campo]?.trim() ?? '') === v.trim());
        }
      }
      return match;
    };

    this.portafolioOpenDS.filter = JSON.stringify(this.filterValue);
  }

  formatDate(dateNumber: number): string {
    if (!dateNumber) return '';
    const dateStr = dateNumber.toString();
    if (dateStr.length !== 8) return dateStr;
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${day}/${month}/${year}`;
  }

  createNew(): void {
    this.router.navigate(['RegistroDeuda']);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.textFilter = filterValue;
    this.filterTable();
  }

  filterTable(): void {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const matchesText =
        !this.textFilter ||
        JSON.stringify(data).toLowerCase().includes(this.textFilter);

      console.log(this.selectedDebtor)
      console.log(data.subsidiaryDebtorId)

      const matchesDebtor =
        !this.selectedDebtor || data.subsidiaryDebtorId === this.selectedDebtor;

      const matchesCreditor =
        !this.selectedCreditor || data.subsidiaryCreditorId === this.selectedCreditor;

      const matchesLoanType =
        !this.selectedLoanType || data.loanTypeId === this.selectedLoanType;

      return matchesText && matchesDebtor && matchesCreditor && matchesLoanType;
    };

    this.dataSource.filter = Math.random().toString();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private loadCatalogs(): void {
    this.loading = true;

    forkJoin({

      acreedores: this.tesoreriaService.getListaAcreedor(),
      loanType: this.tesoreriaService.getListaCombo(10),
      typeProducts: this.tesoreriaService.getListaCombo(14),
      productClasses: this.tesoreriaService.getListaCombo(15)

    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {


        this.subsidiaries = result.acreedores[0].map((a: Acreedor) => ({
          id: a.id,
          name: a.description
        }));


        this.listLoanTypes = result.loanType.map((l: OpcionesCombo) => ({
          id: l.id_combo,
          name: l.descripcion_combo
        }));

        this.listProducTypes = result.typeProducts.map((typeProduct: OpcionesCombo) => ({
          id: typeProduct.id_combo,
          name: typeProduct.descripcion_combo
        }));

        this.listProductClasses = result.productClasses.map((productClass: OpcionesCombo) =>({
          id: productClass.id_combo,
          name: productClass.descripcion_combo
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

  refresh(): void {
    this.loadDebts();
  }

  abrirModal(modal: any, element: any, tipo?: any) {
    this.objetoInitPadre = element;
    this.myModal = true;
    console.log("tipo recibido: ",tipo)
    if (tipo === 'cronograma') {
      this.loading = true;

      this.deudaService.obtenerDeuda(element.id).subscribe({
        next: (response: DebtDetail) => {
          this.loading = false;
          console.log("ABRIR MODAL - cronograma",response)
          this.objetoInitPadre = {
            debt: response,
            schedules: response.schedules
          };

          console.log("ObjetoInitPadre",this.objetoInitPadre)
          this.myModal = true;
          this.modalService.open(modal, {
            windowClass: "my-classModal",
            backdrop: 'static',
            keyboard: false
          });
        },
        error: (error) => {
          console.error('Error al cargar detalle:', error);
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar el detalle de la deuda'
          });
        }
      });
    } if(tipo === 'prepago'){
        this.deudaService.obtenerDeuda(element.id).subscribe({
        next: (response: DebtDetail) => {
          this.loading = false;
          console.log("ABRIR MODAL - prepago",response)
          this.objetoInitPadre = {
            debt: response,
            schedules: response.schedules
          };

          console.log("ObjetoInitPadre",this.objetoInitPadre)
          this.myModal = true;
          this.modalService.open(modal, {
            windowClass: "my-classModal",
            backdrop: 'static',
            keyboard: false
          });
        },
        error: (error) => {
          console.error('Error al cargar detalle:', error);
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar el detalle de la deuda'
          });
        }
      });
    }if (tipo === 'nuevo') {
      this.objetoInitPadre = undefined;
    } else {
      const modalRef = this.modalService.open(modal, {
        windowClass: "my-classModal",
        backdrop: 'static',
        keyboard: false
      });
     
      console.log(this.objetoInitPadre)
      modalRef.result.then(
        (result) => {
          if (result && result.action === 'saved') {
            this.loadDebts();
          }
        },
        (reason) => {
          console.log('Modal cerrado sin guardar');
        }
      );
    }


    const modalRef = this.modalService.open(modal, {
      windowClass: "my-classModal",
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then(
      (result) => {
        // Modal cerrado con éxito
        if (result && result.action === 'saved') {
          this.loadDebts(); // Recargar la lista
        }
      },
      (reason) => {
        // Modal cerrado sin guardar
        console.log('Modal cerrado sin guardar');
      }
    );
  }

  cerrarModal(event: any): void {
    this.myModal = false;
    this.modalService.dismissAll();
    if (event?.action === 'saved') {
      this.loadDebts();
    }
  }


  formatDateSearch(fecha: Date | string | number): string | null {
    /*console.log("La fecha inicial", fecha)
    const d = new Date(fecha);
     console.log("La fecha D", fecha)
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
     console.log("La fecha yyymmdd", yyyy+mm+dd)
    return `${yyyy}${mm}${dd}`;*/

    console.log("La fecha inicial", fecha)
    if (!fecha) return null;

    const d = new Date(fecha);
    console.log("La fecha D", fecha)
    if (isNaN(d.getTime())) return null; // Fecha inválida

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    console.log("La fecha yyymmdd", yyyy+mm+dd)
    return `${yyyy}${mm}${dd}`;


  }

  filtrarTabla(): void {

    if (!this.validarFechas()) {
      console.warn('❌ Rango incompleto detectado. Filtrado cancelado.');
      return;
    }



      console.log('🕒 Rangos seleccionados:');
      console.log('Inicio Vigencia:', this.formatDateSearch(this.filtrosFecha.validityStartDateFrom), '→', this.formatDateSearch(this.filtrosFecha.validityStartDateTo));
      console.log('Desembolso:', this.filtrosFecha.disbursementDateFrom, '→', this.filtrosFecha.disbursementDateTo);
      console.log('Inicio Interés:', this.filtrosFecha.interestStartDateDesde, '→', this.filtrosFecha.interestStartDateHasta);
      console.log('Vencimiento:', this.filtrosFecha.maturityDateFrom, '→', this.filtrosFecha.maturityDateTo);

      // Construir el objeto de búsqueda
      const searchRequest: DebtSearchRequest = {
        validityStartDateFrom: this.formatDateSearch(this.filtrosFecha.validityStartDateFrom) ?? undefined,
        validityStartDateTo: this.formatDateSearch(this.filtrosFecha.validityStartDateTo) ?? undefined ,
        disbursementDateFrom: this.formatDateSearch(this.filtrosFecha.disbursementDateFrom) ?? undefined,
        disbursementDateTo: this.formatDateSearch(this.filtrosFecha.disbursementDateTo) ?? undefined,
        maturityDateFrom: this.formatDateSearch(this.filtrosFecha.maturityDateFrom) ?? undefined,
        maturityDateTo: this.formatDateSearch(this.filtrosFecha.maturityDateTo) ?? undefined
        // otros campos si los hay (paginación, filtros adicionales, etc.)
      };

      // Invocar el servicio
      this.deudaService.buscarDeudasPorFechas(searchRequest).subscribe({
        next: (response) => {
          this.dataSource.data = response.content; // o response.items según tu modelo
          console.log('✅ Datos filtrados recibidos:', response);
        },
        error: (err) => {
          console.error('❌ Error al buscar deudas:', err);
        }
      });

      
    /*this.dataSource.data = this.debts.filter(deuda => {
      return this.filtraPorRango(deuda.validityStartDate, this.filtrosFecha.validityStartDateFrom, this.filtrosFecha.validityStartDateTo)
        && this.filtraPorRango(deuda.disbursementDate, this.filtrosFecha.disbursementDateFrom, this.filtrosFecha.disbursementDateTo)
        && this.filtraPorRango(deuda.interestStartDate, this.filtrosFecha.interestStartDateDesde, this.filtrosFecha.interestStartDateHasta)
        && this.filtraPorRango(deuda.maturityDate, this.filtrosFecha.maturityDateFrom, this.filtrosFecha.maturityDateTo);
    });*/
  }

  filtraPorRango(valor: number | string | Date | null | undefined, desde: Date | null, hasta: Date | null): boolean {
    if (!desde && !hasta) return true;
    if ((desde && !hasta) || (!desde && hasta)) return false;
    if (!valor) return false;

    const fechaValor = this.parsearFecha(valor).getTime();
    const fechaDesde = this.parsearFecha(desde!).getTime();
    const fechaHasta = this.parsearFecha(hasta!).getTime();

    return fechaValor >= fechaDesde && fechaValor <= fechaHasta;
  }

  validarFechas(): boolean {
    const grupos = [
      { desde: this.filtrosFecha.validityStartDateFrom, hasta: this.filtrosFecha.validityStartDateTo, nombre: 'Inicio Vigencia' },
      { desde: this.filtrosFecha.disbursementDateFrom, hasta: this.filtrosFecha.disbursementDateTo, nombre: 'Desembolso' },
      //{ desde: this.filtrosFecha.interestStartDateDesde, hasta: this.filtrosFecha.interestStartDateHasta, nombre: 'Inicio Interés' },
      { desde: this.filtrosFecha.maturityDateFrom, hasta: this.filtrosFecha.maturityDateTo, nombre: 'Vencimiento' }
    ];

    for (const grupo of grupos) {
      const soloDesde = grupo.desde && !grupo.hasta;
      const soloHasta = !grupo.desde && grupo.hasta;
      if (soloDesde || soloHasta) {
        Swal.fire({
          icon: 'warning',
          title: 'Rango incompleto',
          text: `Por favor completa el rango de fechas para "${grupo.nombre}".`
        });
        return false;
      }
    }

    return true;
  }

  /*formatearFecha(fecha: Date | string | number): string {
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const año = d.getFullYear();
    return `${dia}/${mes}/${año}`;
  }*/

  parsearFecha(fecha: Date | string | number): Date {
    return new Date(fecha);
  }

  limpiarFiltrosFecha(): void {
    this.filtrosFecha = {
      validityStartDateFrom: null, //--> fecha validez
      validityStartDateTo: null,
      disbursementDateFrom: null, //--> fecha desembolso
      disbursementDateTo: null,
      maturityDateFrom: null, //--> fecha vencimiento
      maturityDateTo: null,
      // otros filtros si los hay
    };

    //this.applyFilter({ target: { value: '' } }); // limpia el buscador si aplica
    //this.filtrarTabla(); // recarga la lista sin filtros
    this.loadDebts();
  }

  hayFiltrosDeFecha(): boolean {
    const f = this.filtrosFecha;
    return !!(f.validityStartDateFrom || f.validityStartDateTo ||
              f.disbursementDateFrom || f.disbursementDateTo ||
              f.maturityDateFrom || f.maturityDateTo);
  }

  
  campoTieneRango(campo: string): boolean {
    const f = this.filtrosFecha;
    switch (campo) {
      case 'validity':
        return !!(f.validityStartDateFrom && f.validityStartDateTo);
      case 'disbursement':
        return !!(f.disbursementDateFrom && f.disbursementDateTo);
      case 'maturity':
        return !!(f.maturityDateFrom && f.maturityDateTo);
      default:
        return false;
    }
  }

  getRangoPermitido(campo: string): { min: Date | null, max: Date | null } {
    if (this.campoTieneRango(campo)) {
      return { min: null, max: null }; // no limitar si ya fue definido
    }

    const f = this.filtrosFecha;
    const fechas = {
      validity: [f.validityStartDateFrom, f.validityStartDateTo],
      disbursement: [f.disbursementDateFrom, f.disbursementDateTo],
      maturity: [f.maturityDateFrom, f.maturityDateTo]
    };

    const otrosCampos = Object.keys(fechas).filter(k => k !== campo && this.campoTieneRango(k));

    const minFechas = otrosCampos.map(k => fechas[k as keyof typeof fechas][0]).filter(Boolean) as Date[];
    const maxFechas = otrosCampos.map(k => fechas[k as keyof typeof fechas][1]).filter(Boolean) as Date[];

    const min = minFechas.length ? new Date(Math.max(...minFechas.map(d => new Date(d).getTime()))) : null;
    const max = maxFechas.length ? new Date(Math.min(...maxFechas.map(d => new Date(d).getTime()))) : null;

    return { min, max };
  }

  toggleSelectAll(event: MatCheckboxChange): void {
    const checked = event.checked;
    this.dataSource.data.forEach(row => row.seleccionado = checked);
  }


}
