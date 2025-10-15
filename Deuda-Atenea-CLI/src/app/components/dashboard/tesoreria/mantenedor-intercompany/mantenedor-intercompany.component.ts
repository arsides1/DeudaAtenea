import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FacturaCompleto } from 'src/app/models/Tesoreria/facturaCompleto';
import { TesoreriaService } from 'src/app/models/Tesoreria/tesoreria.service';

@Component({
  selector: 'app-mantenedor-intercompany',
  templateUrl: './mantenedor-intercompany.component.html',
  styleUrls: ['./mantenedor-intercompany.component.scss']
})

export class MantenedorIntercompanyComponent implements OnInit {
  public dsIntercompany: MatTableDataSource<FacturaCompleto>;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild('dsSort') dsSort!: MatSort;
  public listIntercompanies: FacturaCompleto[] = [];
  public objIntecompanyEditar: FacturaCompleto = new FacturaCompleto();

  contextMenuPosition = { x: '0px', y: '0px' };
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  onContextMenu(event: MouseEvent, item: any) {
    // this.listCoberturasPorFactura = this.listCoberturasVigentes.filter(e => e.id_co == item.codigo_factura);
    this.objIntecompanyEditar = item;
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { 'item': item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  flgCargando: boolean = false;

  displayedColumns: string[] = [
    't454_id',
    'subsidiaria_deudor',
    'subsidiaria_acreedor',
    't454_id_rate_type',
    't454_rate',
    't454_id_currency',
    'basis',
    't454_start_date',
    't454_end_date',
    't454_term',
    't454_nominal',
    't454_registered_by',
    't454_registration_date',
    't454_record_type'
  ];

  constructor(private tesoreriaService: TesoreriaService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.paginator._intl.itemsPerPageLabel="Registros por Página";
    this.obtenerIntercompanies();
  }

  obtenerIntercompanies(){
    this.flgCargando = true;
    this.tesoreriaService.getListaIntercompanies().subscribe(
      (response: any) => {
        this.listIntercompanies = response;        
        this.dsIntercompany = new MatTableDataSource(this.listIntercompanies);
        this.dsIntercompany.paginator = this.paginator;
        this.dsIntercompany.sort = this.dsSort;
        this.flgCargando = false;
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
        this.flgCargando = false;
      }
    )
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsIntercompany.filter = filterValue.trim().toLowerCase();
    this.dsIntercompany.paginator = this.paginator;
    this.dsIntercompany.sort = this.dsSort;
  }

  formatNumber(value: string): string {
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  formatearFecha(value: string): Date {
    const year = parseInt(value.substring(0, 4), 10);
    const month = parseInt(value.substring(4, 6), 10) - 1; // Los meses son base 0 en JS
    const day = parseInt(value.substring(6, 8), 10);
    return new Date(year, month, day);
  }

  guardarIntercompany(){
    
  }

  abrirModal(modal: any){
    const modalRef =this.modalService.open(modal,{windowClass : "my-classModal",backdrop: 'static', keyboard: false});
  }

  cerrarModal(e){
    this.obtenerIntercompanies();
  }

}
