import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Acreedor } from 'src/app/models/Tesoreria/acreedor';
import { Cuponera } from 'src/app/models/Tesoreria/cuponera';
import { FacturaCompleto } from 'src/app/models/Tesoreria/facturaCompleto';
import { Holiday } from 'src/app/models/Tesoreria/holiday';
import { Moneda } from 'src/app/models/Tesoreria/moneda';
import { OpcionesCombo } from 'src/app/models/Tesoreria/opcionesCombo';
import { TesoreriaService } from 'src/app/models/Tesoreria/tesoreria.service';
import { TipoOC } from 'src/app/models/Tesoreria/tipoOC';
import { TokenService } from 'src/app/shared/services/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-intercompanies',
  templateUrl: './registro-intercompanies.component.html',
  styleUrls: ['./registro-intercompanies.component.scss']
})
export class RegistroIntercompaniesComponent implements OnInit {
  public idDeudorSeleccionado: number = 3;
  public idAcreedorSeleccionado: number = 16;
  public idMonedaSeleccionada: string = 'USD';
  public idBasisSeleccionado: number = 2;
  public idInterestRateTypeSeleccionado: number = 2;
  public idPeriodSeleccionado: number = 0;
  public listAcreedoresCombinados: Array<Array<Acreedor>> = [];
  public listDeudores: Acreedor[] = [];
  public listAcreedores: Acreedor[] = [];
  public listMonedas: Moneda[] = [];
  public listBasis: OpcionesCombo[] = [];
  public listPeriods: OpcionesCombo[] = [];
  public listInterestRateType: OpcionesCombo[] = [];
  public listProvider: OpcionesCombo[] = [];
  public strFecIni: string = "";
  public fec_ini = new Date();
  public strFecFin: string = "";
  public fec_fin = new Date();
  public strFecColocacion: string = "";
  public fec_colocacion = new Date();
  public flgDiasPlazo: boolean = true;
  public flgFecColocacion: boolean = false;
  public nDiasPlazo: number = 360;
  public monto: number = 10000000;
  public tasa: number = 10;
  public listOC: FacturaCompleto[] = [];
  public listFeriados: Holiday[] = [];
  public listFeriadosFiltrados: Holiday[] = [];
  public listTipoOC: TipoOC[] = [];
  public idTipoOC: string = "INTER";
  public listCuponera: Cuponera[] = [];
  public fechasPermitidas;
  public flgBullet: boolean = true;
  public flgDesembolso: boolean = false;

  files: any[] = [];

  constructor(private tesoreriaService: TesoreriaService,
              private tokenService: TokenService,
              private modalService: NgbModal) { }

  ngOnInit(): void {
    this.obtenerTipoOC();
    this.obtenerFeriados();
    this.obtenerMonedas();
    this.obtenerBasis();
    this.obtenerPeriods();
    this.obtenerInterestRateType();
    this.inicializarVariables();
    this.obtenerAcreedor();
  }

  obtenerTipoOC(){
    this.tesoreriaService.getListaTipoOC().subscribe(
      (response: TipoOC[]) => {
        this.listTipoOC = response;
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  inicializarVariables(){
    this.idDeudorSeleccionado = 3;
    this.idMonedaSeleccionada = 'USD';
    this.idBasisSeleccionado = 2;
    this.idInterestRateTypeSeleccionado = 1;
    this.idPeriodSeleccionado = 0;
    this.fec_ini = new Date();
    this.strFecIni = this.dateToString(this.fec_ini);
    this.fec_fin = new Date();
    this.strFecFin = this.dateToString(this.fec_fin);
    this.fec_colocacion = new Date();
    this.strFecColocacion = this.dateToString(this.fec_colocacion);
    this.flgDiasPlazo = true;
    this.flgFecColocacion = false;
    this.nDiasPlazo = 360;
    this.monto = 10000000;
    this.tasa = 10;

    switch(this.idTipoOC){
      case "INTER": //Intercompany
        this.listAcreedores = this.listAcreedoresCombinados[0]; //subsidiarias
        this.idAcreedorSeleccionado = 16;
        break;
      case "PREST": //Préstamo
        this.listAcreedores = this.listAcreedoresCombinados[1]; //contrapartes
        break;
    }

    this.establecerDiasPlazo(this.nDiasPlazo);
  }

  convertNumberToDate(fecha: number): Date{
    const cadenaFecha: string = fecha.toString();
    const year: number = parseInt(cadenaFecha.substring(0, 4), 10);
    const month: number = parseInt(cadenaFecha.substring(4, 6), 10) - 1;
    const day: number = parseInt(cadenaFecha.substring(6, 8), 10);
    return new Date(year, month, day);
  }

  validarFechasHabiles(){
    this.fechasPermitidas = (d: Date | null): boolean => {
      const day = (d || new Date());
      day.setHours(0,0,0,0);
      return ![0,6].includes(day.getDay())
            && !this.listFeriadosFiltrados.map(e =>e.date_key).includes(Number(this.dateToString(day).replace(/-/g, '')));
    };
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
      if(typeof this.strFecFin == 'undefined'  || this.strFecFin==='' ||  this.fec_ini > this.fec_fin){
        this.fec_fin = this.fec_ini;
        this.strFecFin = this.strFecIni;
      }
      const fecha1 = moment(this.fec_ini);
      const fecha2 = moment(this.fec_fin);
      const diferenciaEnDias = fecha2.diff(fecha1, 'days');
      this.nDiasPlazo = diferenciaEnDias;
    }
    else{
      const fecha = moment(this.fec_ini);
      fecha.add(this.nDiasPlazo, 'days');
      this.fec_fin = fecha.toDate();
      this.strFecFin = this.dateToString(this.fec_fin);
    }
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
      this.nDiasPlazo = diferenciaEnDias;
    }
    else{
      const fecha = moment(this.fec_fin);
      fecha.subtract(this.nDiasPlazo, 'days');
      this.fec_ini = fecha.toDate();
      this.strFecIni = this.dateToString(this.fec_ini);
    }
  }

  setDateColocacion(date){
    let posicion=date.indexOf("/",1)
    let posicion2=date.indexOf( "/",posicion+1)

    let pMes=date.substring(0,posicion)
    let pDia=date.substring(posicion+1, posicion2)
    let pAnho=date.substring(posicion2+1)

    this.fec_colocacion =  new Date(pAnho, pMes - 1, pDia);
    this.strFecColocacion = this.dateToString(this.fec_colocacion);
  }

  esDiaHabil(fecha: Date): boolean{
    return ![0,6].includes(fecha.getDay());
  }

  establecerDiasPlazo(event){
    console.log("Dias Plazo: ", event);
    const fecha = moment(this.fec_ini);
    fecha.add(event, 'days');
    // while(!this.esDiaHabil(fecha.toDate())){
    //   fecha.add(1, 'days');
    // }
    this.fec_fin = fecha.toDate();
    this.strFecFin = this.dateToString(this.fec_fin);

    const fecha1 = moment(this.fec_ini);
    const fecha2 = moment(this.fec_fin);
    const diferenciaEnDias = fecha2.diff(fecha1, 'days');
    this.nDiasPlazo = diferenciaEnDias;
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

  obtenerAcreedor(){
    this.tesoreriaService.getListaAcreedor().subscribe(
      (response: Array<Array<Acreedor>>) => {
        this.listAcreedoresCombinados = response;
        this.listAcreedores = response[0];
        this.listDeudores = response[0];


        console.log("Acreedor: ", response);
        console.log("Acreedor - Subsidiaria: ", response[0]);
        console.log("Acreedor - Contraparte: ", response[1]);
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    )
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

  obtenerPeriods(){
    this.tesoreriaService.getListaCombo(4).subscribe(
      (response: OpcionesCombo[]) => {
        this.listPeriods = response;
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  obtenerInterestRateType(){
    this.tesoreriaService.getListaCombo(5).subscribe(
      (response: OpcionesCombo[]) => {
        this.listInterestRateType = response;
        console.log("Tasas Interes: ", response);
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  onSelectDeudor(event){
    this.listFeriadosFiltrados = this.listFeriados.filter(e => e.country == event.country);
    console.log("Deudor: ", this.idDeudorSeleccionado);
    console.log("idTipoOC: ", this.idTipoOC);
  }

  formatearValorTasa(event: Event){
    const inputElement = event.target as HTMLInputElement;
    let newValue = inputElement.value;
    newValue = newValue.replace(/[^0-9.]/g, '');
    inputElement.value = this.formatNumber(newValue);
    this.tasa = Number(newValue);
  }

  formatearValorMonto(event: Event){
    const inputElement = event.target as HTMLInputElement;
    let newValue = inputElement.value;
    newValue = newValue.replace(/[^0-9.]/g, '');
    inputElement.value = this.formatNumber(newValue);
    this.monto = Number(newValue);
  }

  formatNumber(value: string): string {
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  //Adjuntar archivo
  //al arrastrar los archivos
  onFileDropped($event) {
    this.files = $event;
  }

  //al adjuntar los archivos desde el explorador
  fileBrowseHandler(files) {
    this.files = files;
  }

  validarInputs(): boolean{
    return this.idDeudorSeleccionado != undefined
        && this.idAcreedorSeleccionado != undefined
        // && this.idInterestRateTypeSeleccionado != undefined
        && this.idMonedaSeleccionada != undefined
        && this.idPeriodSeleccionado != undefined
        && this.idBasisSeleccionado != undefined
  }

  obtenerCupon(): number{
    let cupon: number = 0;
    if(this.idInterestRateTypeSeleccionado == 1){
      switch (this.idBasisSeleccionado){
        case 1: //actual/actual
          cupon = this.monto * (this.tasa / 100) * (this.nDiasPlazo / 365);
          break;
        case 2: //actual/360
          cupon = this.monto * (this.tasa / 100) * (this.nDiasPlazo / 360);
          break;
        case 3: //actual/365
          cupon = this.monto * (this.tasa / 100) * (this.nDiasPlazo / 365);
          break;
        case 4: //30/360
          cupon = this.monto * (this.tasa / 100) * ((this.fec_fin.getDate() - this.fec_ini.getDate()) / 360);
          break;
      }
    } else if (this.idInterestRateTypeSeleccionado == 2){
      switch (this.idBasisSeleccionado){
        case 1: //actual/actual
          cupon = this.monto * (Math.pow((1 + (this.tasa / 100)), (this.nDiasPlazo / 365)) - 1);
          break;
        case 2: //actual/360
          cupon = this.monto * (Math.pow((1 + (this.tasa / 100)), (this.nDiasPlazo / 360)) - 1);
          break;
        case 3: //actual/365
          cupon = this.monto * (Math.pow((1 + (this.tasa / 100)), (this.nDiasPlazo / 365)) - 1);
          break;
        case 4: //30/360
          cupon = this.monto * Math.pow((1 + (this.tasa / 100)), ((this.fec_fin.getDate() - this.fec_ini.getDate()) / 360));
          break;
      }
    }
    return cupon;
  }

  generarCuponeraBullet(modal: any){
    this.listCuponera = [];
    let objCuponera: Cuponera = new Cuponera();
    objCuponera.id_co = this.idTipoOC.substring(0,3) + "_";
    objCuponera.start_date = Number(this.strFecIni.replace(/-/g, ''));
    objCuponera.end_date = Number(this.strFecFin.replace(/-/g, ''));
    objCuponera.coupon = this.obtenerCupon();
    objCuponera.amortization = this.monto + objCuponera.coupon;
    objCuponera.residue = 0;
    this.listCuponera.push(objCuponera);
    console.log("Cuponera: ", objCuponera);

    // const modalRef =this.modalService.open(modal,{windowClass : "my-classModal",backdrop: 'static', keyboard: false});
  }

  registrar(modal: any){
    if (this.validarInputs()){
      this.listOC = [];
      this.guardarOC();
      // this.generarCuponeraBullet(modal);
      const modalRef =this.modalService.open(modal,{windowClass : "my-classModal",backdrop: 'static', keyboard: false});
    }
    else{
      Swal.fire({
        position: 'center',
        icon: 'warning',
        title: 'No se han completado todos los campos',
        confirmButtonText: "Aceptar",
        confirmButtonColor: '#4b822d'
      });
    }
  }

  guardarOC(){

    let fechaHoy = new Date();
    let fechaHoyFormat = `${fechaHoy.getFullYear()}${(fechaHoy.getMonth() + 1).toString().padStart(2, '0')}${fechaHoy.getDate().toString().padStart(2, '0')}`;

    let objOC: FacturaCompleto = new FacturaCompleto();
    objOC.t454_id_rate_type = this.listInterestRateType.filter(e => e.id_combo == this.idInterestRateTypeSeleccionado)[0].descripcion_combo;
    objOC.t454_rate = (this.tasa / 100);
    objOC.t454_start_date = Number(this.strFecIni.replace(/-/g, ''));
    objOC.t454_end_date = Number(this.strFecFin.replace(/-/g, ''));
    objOC.t454_term = this.nDiasPlazo;
    objOC.t454_id_currency = this.idMonedaSeleccionada;
    objOC.t454_id_periods = this.idPeriodSeleccionado;
    objOC.t454_id_basis = this.idBasisSeleccionado;
    objOC.t454_nominal = this.monto;
    objOC.t454_id_subsidiary_debtor = this.idDeudorSeleccionado;

    if(this.idTipoOC == "INTER")
      objOC.t454_id_subsidiary_creditor = this.idAcreedorSeleccionado;
    else if (this.idTipoOC == "PREST")
      objOC.t454_id_counterpart_creditor = this.idAcreedorSeleccionado;

    if((this.idTipoOC == "PREST" || this.idTipoOC == "BONO") && this.flgFecColocacion)
      objOC.t454_placement_date = Number(this.strFecColocacion.replace(/-/g, ''));

    objOC.t454_id = this.idTipoOC.substring(0, 3) + "_";
    objOC.t454_registered_by = this.tokenService.getUserName();
    objOC.t454_registration_date = Number(fechaHoyFormat);
    objOC.t454_record_type = 'ATENEA';
    objOC.t454_document_date = Number(this.strFecIni.replace(/-/g, ''));
    objOC.t454_id_type_co = this.idTipoOC;
    objOC.t454_id_coverage_type = 1;
    objOC.t454_id_risk_type = 0;
    objOC.t454_id_underlying = 27;
    objOC.t454_id_shipment = 1206;
    objOC.t454_nominal_usd = this.monto; //tc
    objOC.t454_nominal_paid_usd = 0;
    objOC.t454_residue_usd = this.monto; //tc
    objOC.t454_id_treasury_state = 1;
    objOC.t454_grouper = '';
    objOC.t454_contract = '';
    objOC.t454_contract_type = '';
    objOC.t454_ticker = '';
    objOC.t454_future = '';
    objOC.t454_volume = 0;
    objOC.t454_num_contracts = 0;
    objOC.t454_future_price = 0;
    objOC.t454_upload_start_date = Number(fechaHoyFormat);
    objOC.t454_upload_end_date = Number(fechaHoyFormat);
    objOC.t454_settlement_date = Number(this.strFecFin.replace(/-/g, ''));

    this.listOC.push(objOC);

    console.log("objOC: ", objOC);
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
    this.nDiasPlazo = Number(newValue); 

    this.establecerDiasPlazo(this.nDiasPlazo);
  }

  cerrarModal(e){
    this.inicializarVariables();
  }

}
