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
    'claseProducto',
    'subsidiaryDebtorName',
    'subsidiaryCreditorName',
    'loanTypeName',
    'validityStartDate',
    'disbursementDate',
    'interestStartDate',
    'maturityDate',
    'currencyId',
    'nominal',
    'amortizationRate',
    'amortizationStartPayment',
    'periodsName',
    'rateClassificationName',
    'referenceRate',
    'termSofrAdj',
    'applicableMargin',
    'rateTypeId',
    'operationTrm'
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

  validityStartDateDesde: null,
  validityStartDateHasta: null,
  disbursementDateDesde: null,
  disbursementDateHasta: null,
  interestStartDateDesde: null,
  interestStartDateHasta: null,
  maturityDateDesde: null,
  maturityDateHasta: null



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

  // VARIABLES DE SELECCIÓN
  selectedDebtor: number | null = null;
  selectedCreditor: number | null = null;
  selectedLoanType: number | null = null;

  // DATOS DE ENTIDADES
  subsidiaries: any[] = [];
  loanTypes: any[] = [];
  listTypeProducts: any[] = [];
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
        this.debts = response.content;
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


        this.loanTypes = result.loanType.map((l: OpcionesCombo) => ({
          id: l.id_combo,
          name: l.descripcion_combo
        }));

        this.listTypeProducts = result.typeProducts.map((typeProduct: OpcionesCombo) => ({
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

          this.objetoInitPadre = {
            debt: response,
            schedules: response.schedules
          };

          console.log(this.objetoInitPadre)
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
    } if (tipo === 'nuevo') {
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

  filtrarTabla(): void {
    if (!this.validarFechas()) return;

     console.log('🕒 Rangos seleccionados:');
  console.log('Inicio Vigencia:', this.filtros.validityStartDateDesde, '→', this.filtros.validityStartDateHasta);
  console.log('Desembolso:', this.filtros.disbursementDateDesde, '→', this.filtros.disbursementDateHasta);
  console.log('Inicio Interés:', this.filtros.interestStartDateDesde, '→', this.filtros.interestStartDateHasta);
  console.log('Vencimiento:', this.filtros.maturityDateDesde, '→', this.filtros.maturityDateHasta);




    this.dataSource.data = this.debts.filter(deuda => {
      return this.filtraPorRango(deuda.validityStartDate, this.filtros.validityStartDateDesde, this.filtros.validityStartDateHasta)
        && this.filtraPorRango(deuda.disbursementDate, this.filtros.disbursementDateDesde, this.filtros.disbursementDateHasta)
        && this.filtraPorRango(deuda.interestStartDate, this.filtros.interestStartDateDesde, this.filtros.interestStartDateHasta)
        && this.filtraPorRango(deuda.maturityDate, this.filtros.maturityDateDesde, this.filtros.maturityDateHasta);
    });
  }

  filtraPorRango(valor: number | string | Date | null | undefined, desde: Date | null, hasta: Date | null): boolean {

    if (!desde && !hasta) return true;
    if ((desde && !hasta) || (!desde && hasta)) return false;
    if (!valor) return false;

    const fechaValor = this.formatearFecha(valor);
    const fechaDesde = this.formatearFecha(desde!);
    const fechaHasta = this.formatearFecha(hasta!);

    return fechaValor >= fechaDesde && fechaValor <= fechaHasta;


  }

  validarFechas(): boolean {
    const grupos = [
      { desde: this.filtros.validityStartDateDesde, hasta: this.filtros.validityStartDateHasta, nombre: 'Inicio Vigencia' },
      { desde: this.filtros.disbursementDateDesde, hasta: this.filtros.disbursementDateHasta, nombre: 'Desembolso' },
      { desde: this.filtros.interestStartDateDesde, hasta: this.filtros.interestStartDateHasta, nombre: 'Inicio Interés' },
      { desde: this.filtros.maturityDateDesde, hasta: this.filtros.maturityDateHasta, nombre: 'Vencimiento' }
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

  formatearFecha(fecha: Date | string | number): string {
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const año = d.getFullYear();
    return `${dia}/${mes}/${año}`;
  }



}
