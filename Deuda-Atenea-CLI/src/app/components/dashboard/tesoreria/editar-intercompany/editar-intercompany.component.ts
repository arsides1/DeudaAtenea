import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Acreedor } from 'src/app/models/Tesoreria/acreedor';
import { Cuponera } from 'src/app/models/Tesoreria/cuponera';
import { EstructuraCorreo } from 'src/app/models/Tesoreria/estructuraCorreo';
import { FacturaCompleto } from 'src/app/models/Tesoreria/facturaCompleto';
import { HistoricoModificacion } from 'src/app/models/Tesoreria/historicoModificacion';
import { Holiday } from 'src/app/models/Tesoreria/holiday';
import { Moneda } from 'src/app/models/Tesoreria/moneda';
import { OpcionesCombo } from 'src/app/models/Tesoreria/opcionesCombo';
import { TesoreriaService } from 'src/app/models/Tesoreria/tesoreria.service';
import { TokenService } from 'src/app/shared/services/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-intercompany',
  templateUrl: './editar-intercompany.component.html',
  styleUrls: ['./editar-intercompany.component.scss']
})
export class EditarIntercompanyComponent implements OnInit {
  @Input() objIntercompany:FacturaCompleto;
  @Output () close: EventEmitter<boolean>= new EventEmitter();

  objIntercompanyEditar: FacturaCompleto = new FacturaCompleto();
  listCuponera: Cuponera[] = [];

  public listDeudores: Acreedor[] = [];
  public listAcreedores: Acreedor[] = [];
  public listMonedas: Moneda[] = [];
  public listBasis: OpcionesCombo[] = [];
  public listInterestRateType: OpcionesCombo[] = [];
  public listProvider: OpcionesCombo[] = [];
  public strFecIni: string = "";
  public fec_ini = new Date();
  public strFecFin: string = "";
  public fec_fin = new Date();
  public flgDiasPlazo: boolean = false;
  public fechasPermitidas;
  public listFeriados: Holiday[] = [];
  public listFeriadosFiltrados: Holiday[] = [];
  public estructuraCorreo: EstructuraCorreo = new EstructuraCorreo();

  constructor(private modalService: NgbModal, private tesoreriaService: TesoreriaService, private tokenService: TokenService) { }

  ngOnInit(): void {
    this.objIntercompanyEditar = {...this.objIntercompany};
    this.obtenerCuponeraPorIntercompany();
    this.obtenerAcreedor();
    this.obtenerInterestRateType();
    this.obtenerBasis();
    this.obtenerMonedas();

    this.fec_ini = this.formatearFecha(this.objIntercompanyEditar.t454_start_date.toString());
    this.strFecIni = this.dateToString(this.fec_ini);
    this.fec_fin = this.formatearFecha(this.objIntercompanyEditar.t454_end_date.toString());
    this.strFecFin = this.dateToString(this.fec_fin);
  }

  obtenerCuponeraPorIntercompany(){
    this.tesoreriaService.getCuponeraPorIntercompany(this.objIntercompany.t454_id).subscribe(
      (response: Cuponera[]) => {
        this.listCuponera = response;
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    )
  }

  validarFechasHabiles(){
    this.fechasPermitidas = (d: Date | null): boolean => {
      const day = (d || new Date());
      day.setHours(0,0,0,0);
      return ![0,6].includes(day.getDay())
            && !this.listFeriadosFiltrados.map(e =>e.date_key).includes(Number(this.dateToString(day).replace(/-/g, '')));
    };
  }

  obtenerFeriados(){
    this.tesoreriaService.getListaFeriados().subscribe(
      (response: Holiday[]) => {
        this.listFeriados = response;
        this.listFeriadosFiltrados = response.filter(e => e.country == 'PE');
        this.validarFechasHabiles()
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  onSelectDeudor(event){
    this.listFeriadosFiltrados = this.listFeriados.filter(e => e.country == event.country);
  }

  public dateToString = ((date) => {
    if(date.getDate()<10 && (date.getMonth() + 1)<10){
      return `${date.getFullYear()}-0${(date.getMonth() + 1)}-0${date.getDate()}`.toString();
    }else if (date.getDate()<10 ){
      return `${date.getFullYear()}-${(date.getMonth() + 1)}-0${date.getDate()}`.toString();
    }else if ((date.getMonth() + 1)<10){
      return `${date.getFullYear()}-0${(date.getMonth() + 1)}-${date.getDate()}`.toString();
    }else{
      return `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}`.toString();
    }
  });

  convertirFechaAEntero(fecha: string): number {
    const [anio, mes, dia] = fecha.split('-');
    const fechaEntero = parseInt(anio + mes + dia, 10);
    return fechaEntero;
  }

  setDateInicio(date){
    let posicion=date.indexOf("/",1)
    let posicion2=date.indexOf( "/",posicion+1)

    let pMes=date.substring(0,posicion)
    let pDia=date.substring(posicion+1, posicion2)
    let pAnho=date.substring(posicion2+1)

    this.fec_ini =  new Date(pAnho, pMes - 1, pDia);
    this.fec_ini.setHours(0,0,0,0);
    this.strFecIni = this.dateToString(this.fec_ini);

    this.fec_fin.setHours(0,0,0,0);

    if(!this.flgDiasPlazo){
      if(typeof this.strFecFin == 'undefined' || this.strFecFin==='' || this.fec_ini > this.fec_fin){
        this.fec_fin = this.fec_ini;
        this.strFecFin = this.strFecIni;
      }
      const fecha1 = moment(this.fec_ini);
      const fecha2 = moment(this.fec_fin);
      const diferenciaEnDias = fecha2.diff(fecha1, 'days');
      this.objIntercompanyEditar.t454_term = diferenciaEnDias;
    }
    else{
      const fecha = moment(this.fec_ini);
      fecha.add(this.objIntercompanyEditar.t454_term, 'days');
      this.fec_fin = fecha.toDate();
      this.strFecFin = this.dateToString(this.fec_fin);
    }

    this.objIntercompanyEditar.t454_start_date = this.convertirFechaAEntero(this.strFecIni);
    this.objIntercompanyEditar.t454_end_date = this.convertirFechaAEntero(this.strFecFin);
  }

  setDateFin(date){
    let posicion=date.indexOf("/",1)
    let posicion2=date.indexOf( "/",posicion+1)

    let pMes=date.substring(0,posicion)
    let pDia=date.substring(posicion+1, posicion2)
    let pAnho=date.substring(posicion2+1)

    this.fec_fin =  new Date(pAnho, pMes - 1, pDia);
    this.fec_fin.setHours(0,0,0,0);
    this.strFecFin = this.dateToString(this.fec_fin);

    this.fec_ini.setHours(0,0,0,0);

    if(!this.flgDiasPlazo){
      if(typeof this.strFecIni == 'undefined'  || this.strFecIni==='' || this.fec_ini > this.fec_fin){
        this.fec_ini = this.fec_fin;
        this.strFecIni = this.strFecFin;
      }
      const fecha1 = moment(this.fec_ini);
      const fecha2 = moment(this.fec_fin);
      const diferenciaEnDias = fecha2.diff(fecha1, 'days');
      this.objIntercompanyEditar.t454_term = diferenciaEnDias;
    }
    else{
      const fecha = moment(this.fec_fin);
      fecha.subtract(this.objIntercompanyEditar.t454_term, 'days');
      this.fec_ini = fecha.toDate();
      this.strFecIni = this.dateToString(this.fec_ini);
    }
    this.objIntercompanyEditar.t454_start_date = this.convertirFechaAEntero(this.strFecIni);
    this.objIntercompanyEditar.t454_end_date = this.convertirFechaAEntero(this.strFecFin);
  }

  obtenerAcreedor(){
    this.tesoreriaService.getListaAcreedor().subscribe(
      (response: Array<Array<Acreedor>>) => {
        this.listAcreedores = response[0];
        this.listDeudores = response[0];
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    )
  }

  obtenerInterestRateType(){
    this.tesoreriaService.getListaCombo(5).subscribe(
      (response: OpcionesCombo[]) => {
        this.listInterestRateType = response;
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  obtenerBasis(){
    this.tesoreriaService.getListaCombo(3).subscribe(
      (response: OpcionesCombo[]) => {
        this.listBasis = response;
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  obtenerMonedas(){
    this.tesoreriaService.getListaMonedas().subscribe(
      (response: Moneda[]) => {
        this.listMonedas = response.filter(e => e.t064Status = true);
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  formatearValor(event: Event){
    const inputElement = event.target as HTMLInputElement;
    let newValue = inputElement.value;

    // Validar que solo se ingresen números, un punto decimal y números positivos
    newValue = newValue.replace(/[^0-9]/g, '');

    if(newValue == ''){
      newValue = (0).toString();
    }

    // Actualizar el valor del input y la variable
    inputElement.value = this.formatNumber(newValue);
    this.objIntercompanyEditar.t454_term = Number(newValue); 

    this.establecerDiasPlazo(this.objIntercompanyEditar.t454_term);
  }

  establecerDiasPlazo(event){
    const fecha = moment(this.fec_ini);
    fecha.add(event, 'days');
    this.fec_fin = fecha.toDate();
    this.strFecFin = this.dateToString(this.fec_fin);

    const fecha1 = moment(this.fec_ini);
    const fecha2 = moment(this.fec_fin);
    const diferenciaEnDias = fecha2.diff(fecha1, 'days');
    this.objIntercompanyEditar.t454_term = diferenciaEnDias;
  }

  formatNumber(value: string): string {
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  formatearValorTasa(event: Event){
    const inputElement = event.target as HTMLInputElement;
    let newValue = inputElement.value;
    newValue = newValue.replace(/[^0-9.]/g, '');
    inputElement.value = this.formatNumber(newValue);
    this.objIntercompanyEditar.t454_rate = Number(newValue) / 100;
  }

  formatearValorMonto(event: Event){
    const inputElement = event.target as HTMLInputElement;
    let newValue = inputElement.value;
    newValue = newValue.replace(/[^0-9.]/g, '');
    inputElement.value = this.formatNumber(newValue);
    this.objIntercompanyEditar.t454_nominal = Number(newValue);
    this.objIntercompanyEditar.t454_nominal_usd = Number(newValue);
    this.objIntercompanyEditar.t454_residue_usd = Number(newValue) - this.objIntercompanyEditar.t454_nominal_paid_usd;
  }

  formatearFecha(value: string): Date {
    const year = parseInt(value.substring(0, 4), 10);
    const month = parseInt(value.substring(4, 6), 10) - 1; // Los meses son base 0 en JS
    const day = parseInt(value.substring(6, 8), 10);
    return new Date(year, month, day);
  }

  closeModal(){
    this.close.emit(false);
  }

  cerrar(){
    this.closeModal();
    this.modalService.dismissAll();
  }

  compareObjects(original: any, modified: any, diccionario: { [key: string]: string }): string[] {
    let camposModificados: string[] = [];
    for (let key in original) {
      if (original.hasOwnProperty(key) && diccionario.hasOwnProperty(key)) {
        // Solo comparamos las propiedades que están en el diccionario
        if (original[key] !== modified[key]) {
          camposModificados.push(key);
        }
      }
    }
    return camposModificados;
  }

  obtenerTablaRegistroMail(tabla): string{
    let strTabla = "";
    strTabla += '<table class="miTabla">';
    strTabla += '<tr>';
    for (let key of Object.keys(tabla)) {
      strTabla += "<th>";
      strTabla += key;
      strTabla += "</th>";
    }
    strTabla += "</tr>";
    strTabla += "<tr>";

    for (let key of Object.keys(tabla)) {
      strTabla += "<td>";
      strTabla += tabla[key];
      strTabla += "</td>";
    }

    strTabla += "</tr>";
    strTabla += "</table>";

    console.log("tabla html: ", strTabla);

    return strTabla;
  }

  obtenerCupon(): number{
    let cupon: number = 0;
    if(this.objIntercompanyEditar.t454_id_rate_type == 'TNA'){
      switch (this.objIntercompanyEditar.t454_id_basis){
        case 1: //actual/actual
          cupon = this.objIntercompanyEditar.t454_nominal * (this.objIntercompanyEditar.t454_rate) * (this.objIntercompanyEditar.t454_term / 365);
          break;
        case 2: //actual/360
          cupon = this.objIntercompanyEditar.t454_nominal * (this.objIntercompanyEditar.t454_rate) * (this.objIntercompanyEditar.t454_term / 360);
          break;
        case 3: //actual/365
          cupon = this.objIntercompanyEditar.t454_nominal * (this.objIntercompanyEditar.t454_rate) * (this.objIntercompanyEditar.t454_term / 365);
          break;
        case 4: //30/360
          cupon = this.objIntercompanyEditar.t454_nominal * (this.objIntercompanyEditar.t454_rate) * ((Number(this.objIntercompanyEditar.t454_end_date.toString().slice(6,8)) - Number(this.objIntercompanyEditar.t454_start_date.toString().slice(6,8))) / 360);
          break;
      }
    } else if (this.objIntercompanyEditar.t454_id_rate_type == 'TEA'){
      switch (this.objIntercompanyEditar.t454_id_basis){
        case 1: //actual/actual
          cupon = this.objIntercompanyEditar.t454_nominal * (Math.pow((1 + (this.objIntercompanyEditar.t454_rate)), (this.objIntercompanyEditar.t454_term / 365)) - 1);
          break;
        case 2: //actual/360
          cupon = this.objIntercompanyEditar.t454_nominal * (Math.pow((1 + (this.objIntercompanyEditar.t454_rate)), (this.objIntercompanyEditar.t454_term / 360)) - 1);
          break;
        case 3: //actual/365
          cupon = this.objIntercompanyEditar.t454_nominal * (Math.pow((1 + (this.objIntercompanyEditar.t454_rate)), (this.objIntercompanyEditar.t454_term / 365)) - 1);
          break;
        case 4: //30/360
          cupon = this.objIntercompanyEditar.t454_nominal * Math.pow((1 + (this.objIntercompanyEditar.t454_rate)), ((Number(this.objIntercompanyEditar.t454_end_date.toString().slice(6,8)) - Number(this.objIntercompanyEditar.t454_start_date.toString().slice(6,8))) / 360));
          break;
      }
    }
    return cupon;
  }
  
  guardar(){
    this.listCuponera.map(e => (
      e.start_date = this.objIntercompanyEditar.t454_start_date
      , e.end_date = this.objIntercompanyEditar.t454_end_date
      , e.coupon = this.obtenerCupon()
      , e.amortization = this.objIntercompanyEditar.t454_nominal + this.obtenerCupon()
    ));
    
    this.tesoreriaService.postEditarOC(this.objIntercompanyEditar, this.listCuponera).subscribe(
      (response: any) => {
        const diccionarioColumnas: { [key: string]: string } = {
          't454_id_subsidiary_debtor': 'Deudor',
          't454_id_subsidiary_creditor': 'Acreedor',
          't454_id_rate_type': 'Tipo Tasa',
          't454_rate': 'Tasa',
          't454_id_basis': 'Basis',
          't454_start_date': 'Fecha Inicio',
          't454_end_date': 'Fecha Fin',
          't454_term': 'Plazo',
          't454_id_currency': 'Moneda',
          't454_nominal': 'Monto'
        };

        let camposModificados = this.compareObjects(this.objIntercompany, this.objIntercompanyEditar, diccionarioColumnas);
        let camposModificadosDiccionario = camposModificados.map(e => diccionarioColumnas[e]);

        let strTablaRegistroOC: string = this.obtenerTablaRegistroMail(response[0]);

        let estilos = '<style type="text/css">';
        estilos += ' .miTabla {border-collapse:collapse; border-color:white;}';
        estilos += ' .miTabla th {background:#c80f1e; color:white;}';
        estilos += ' .miTabla td {color:black; background:#DBDBDB;}';
        estilos += ' .miTabla td, .miTabla th {padding:1.5px 20px; border:1.5px solid white; text-align:center}';
        estilos += ' </style>';

        this.estructuraCorreo.asunto = '[REGISTRO] Préstamo Intercompany de Alicorp S.A.A. hacia Alicorp Uruguay S.R.L. por USD 10MM - Actualización'
        this.estructuraCorreo.cuerpo = `${estilos}<p>Estimados,<br><br> Les informamos que se actualizaron los siguientes campos: <br><br> ${camposModificadosDiccionario.map(e => '● ' + e).join('<br>')} <br><br> ${strTablaRegistroOC} <br><br> Saludos.<br>Equipo de Riesgos de Tesorería.</p>`;
        this.estructuraCorreo.copiar = "RegistroIntercompany;Copia";
        this.estructuraCorreo.destinatarios = "RegistroIntercompany;Destinatario";
        this.estructuraCorreo.importante = false;
        this.estructuraCorreo.adjuntos = [];

        let listModificationHistory: HistoricoModificacion[] = [];

        for(let campo of camposModificados){
          let objMoficationHistory = new HistoricoModificacion();
          objMoficationHistory.t486_id_process = 9;
          objMoficationHistory.t486_table_name = 't454_coverage_objects';
          objMoficationHistory.t486_table_register_id = this.objIntercompanyEditar.t454_id;
          objMoficationHistory.t486_column_name = campo;
          objMoficationHistory.t486_previous_value = this.objIntercompany[campo].toString();
          objMoficationHistory.t486_new_value = this.objIntercompanyEditar[campo].toString();
          objMoficationHistory.t486_registered_by = this.tokenService.getUserName();
          listModificationHistory.push(objMoficationHistory);
        }

        this.tesoreriaService.postGuardarControlCambios(listModificationHistory).subscribe(
          (response: any) => {
            this.tesoreriaService.postEnvioCorreoJava(this.estructuraCorreo).subscribe(
              (response: any) => {
                Swal.fire({
                  position: 'center',
                  icon: 'success',
                  title: `El intecompany ${this.objIntercompanyEditar.t454_id} ha sido modificado con éxito`,
                  confirmButtonText: "Aceptar",
                  confirmButtonColor: '#4b822d'
                });
                this.cerrar();
              },(error: HttpErrorResponse) => {
                alert(error.message);
              }
            );
          },
          (error: HttpErrorResponse) => {
            alert(error.message);
          }
        );
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    )
  }

}
