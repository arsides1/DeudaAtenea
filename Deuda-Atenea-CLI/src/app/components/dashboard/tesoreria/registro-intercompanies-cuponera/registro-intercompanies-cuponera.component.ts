import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Cuponera } from 'src/app/models/Tesoreria/cuponera';
import { FacturaCompleto } from 'src/app/models/Tesoreria/facturaCompleto';
import { TesoreriaService } from 'src/app/models/Tesoreria/tesoreria.service';
import { EstructuraCorreo } from 'src/app/models/Tesoreria/estructuraCorreo';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-intercompanies-cuponera',
  templateUrl: './registro-intercompanies-cuponera.component.html',
  styleUrls: ['./registro-intercompanies-cuponera.component.scss']
})
export class RegistroIntercompaniesCuponeraComponent implements OnInit {
  dsCuponera: MatTableDataSource<Cuponera>;
  listCuponera: Cuponera[];

  public estructuraCorreo: EstructuraCorreo = new EstructuraCorreo();

  @Input() listOC:FacturaCompleto [];
  @Input() flg_desembolso: boolean;
  @Output () close: EventEmitter<boolean>= new EventEmitter();

  displayedColumns: string[] = [
    'start_date',
    'end_date',
    'coupon',
    'amortization'
  ];

  constructor(private modalService: NgbModal, private tesoreriaService: TesoreriaService) { }

  ngOnInit(): void {
    this.listCuponera = this.listOC.map((e) => {return {
      id : 0
      , id_co: e.t454_id
      , start_date: e.t454_start_date
      , end_date: e.t454_end_date
      , coupon: this.obtenerCupon(e)
      , amortization: e.t454_nominal + this.obtenerCupon(e)
      , residue: 0}});
    this.dsCuponera = new MatTableDataSource(this.listCuponera);
  }

  obtenerCupon(coverage_object: FacturaCompleto): number{
    let cupon: number = 0;
    if(coverage_object.t454_id_rate_type == 'TNA'){
      switch (coverage_object.t454_id_basis){
        case 1: //actual/actual
          cupon = coverage_object.t454_nominal * (coverage_object.t454_rate) * (coverage_object.t454_term / 365);
          break;
        case 2: //actual/360
          cupon = coverage_object.t454_nominal * (coverage_object.t454_rate) * (coverage_object.t454_term / 360);
          break;
        case 3: //actual/365
          cupon = coverage_object.t454_nominal * (coverage_object.t454_rate) * (coverage_object.t454_term / 365);
          break;
        case 4: //30/360
          cupon = coverage_object.t454_nominal * (coverage_object.t454_rate) * ((Number(coverage_object.t454_end_date.toString().slice(6,8)) - Number(coverage_object.t454_start_date.toString().slice(6,8))) / 360);
          break;
      }
    } else if (coverage_object.t454_id_rate_type == 'TEA'){
      switch (coverage_object.t454_id_basis){
        case 1: //actual/actual
          cupon = coverage_object.t454_nominal * (Math.pow((1 + (coverage_object.t454_rate)), (coverage_object.t454_term / 365)) - 1);
          break;
        case 2: //actual/360
          cupon = coverage_object.t454_nominal * (Math.pow((1 + (coverage_object.t454_rate)), (coverage_object.t454_term / 360)) - 1);
          break;
        case 3: //actual/365
          cupon = coverage_object.t454_nominal * (Math.pow((1 + (coverage_object.t454_rate)), (coverage_object.t454_term / 365)) - 1);
          break;
        case 4: //30/360
          cupon = coverage_object.t454_nominal * Math.pow((1 + (coverage_object.t454_rate)), ((Number(coverage_object.t454_end_date.toString().slice(6,8)) - Number(coverage_object.t454_start_date.toString().slice(6,8))) / 360));
          break;
      }
    }
    return cupon;
  }

  closeModal(){
    this.close.emit(false);
  }

  cerrar(){
    this.closeModal();
    this.modalService.dismissAll();
  }

  registrar(){
    Swal.fire({
      icon: 'question',
      title: 'Registrar ' + (this.listOC[0].t454_id_type_co == 'INTER' ? 'Intercompany' 
                              : this.listOC[0].t454_id_type_co == 'PREST' ? 'Préstamo' 
                              : this.listOC[0].t454_id_type_co == 'BONO' ? 'Bono' 
                              : ''),
      html: '¿Desea registrar el ' + (this.listOC[0].t454_id_type_co == 'INTER' ? 'Intercompany' 
                                        : this.listOC[0].t454_id_type_co == 'PREST' ? 'Préstamo' 
                                        : this.listOC[0].t454_id_type_co == 'BONO' ? 'Bono' 
                                        : '') + '?',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Continuar',
      reverseButtons: true,
      confirmButtonColor: '#4b822d'
    }).then((result) => {
      if (result.isConfirmed){
        for(let i of this.listOC){
          this.tesoreriaService.postGuardarCO_Cuponera(i, this.listCuponera, this.flg_desembolso).subscribe(
            (response: any) => {
              console.log("POST GUARDAR CO: ", response);
              this.envioCorreo(response[0], response[1]);
            },
            (error: HttpErrorResponse) => {
              alert(error.message);
            }
          );
        }
      }
    }
    );
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

  envioCorreo(tabla, cuerpoCorreo){
    let estilos = '<style type="text/css">';
    estilos += ' .miTabla {border-collapse:collapse; border-color:white;}';
    estilos += ' .miTabla th {background:#c80f1e; color:white;}';
    estilos += ' .miTabla td {color:black; background:#DBDBDB;}';
    estilos += ' .miTabla td, .miTabla th {padding:1.5px 20px; border:1.5px solid white; text-align:center}';
    estilos += ' </style>';

    let strTablaRegistroOC: string = this.obtenerTablaRegistroMail(tabla);

    this.estructuraCorreo.asunto = "[REGISTRO] " 
      + (this.listOC[0].t454_id_type_co == 'INTER' ? 'Préstamo Intercompany' 
        : this.listOC[0].t454_id_type_co == 'PREST' ? 'Pagaré' 
        : this.listOC[0].t454_id_type_co == 'BONO' ? ' ' 
        : ' ') 
      + " de " 
      + tabla[(this.listOC[0].t454_id_type_co == 'INTER' ? 'Deudor' 
        : this.listOC[0].t454_id_type_co == 'PREST' ? 'Subsidiaria' 
        : this.listOC[0].t454_id_type_co == 'BONO' ? '' 
        : '')] 
      + " hacia " 
      + tabla[(this.listOC[0].t454_id_type_co == 'INTER' ? 'Acreedor' 
        : this.listOC[0].t454_id_type_co == 'PREST' ? 'Banco' 
        : this.listOC[0].t454_id_type_co == 'BONO' ? '' 
        : '')] 
      + " por "
      + tabla['Moneda'] + " "
      + Math.trunc(Number(tabla[(this.listOC[0].t454_id_type_co == 'INTER' ? 'Capital Original' 
        : this.listOC[0].t454_id_type_co == 'PREST' ? 'Capital' 
        : this.listOC[0].t454_id_type_co == 'BONO' ? '' 
        : '')].replace(/,/g, '')) / 1000000)
      + "MM";


    let nombreSaludo: string = "";
    for(let datosUsuario  of cuerpoCorreo.UsuarioSaludo){
      nombreSaludo += datosUsuario.usuario.split(" ")[0] + ", ";
    }

    if(this.listOC[0].t454_id_type_co == 'INTER'){
      this.estructuraCorreo.cuerpo = `${estilos}<p>Estimados,<br><br>Buenos días, espero estén bien.<br>${cuerpoCorreo.CuerpoCabecera}<br><br>${strTablaRegistroOC}<br>${cuerpoCorreo.CuerpoPie}<br><br>Saludos.<br>Equipo de Riesgos de Tesorería.</p>`;      
    }
    else{
      this.estructuraCorreo.cuerpo = `${estilos}<p>Hola ${nombreSaludo}<br><br>Favor tu apoyo con el registro del nuevo pagaré pactado considerando el siguiente detalle:<br><br>${strTablaRegistroOC}<br>Saludos.<br>Equipo de Riesgos de Tesorería.</p>`;
    }
    

    this.estructuraCorreo.copiar = "RegistroIntercompany;Copia";
    this.estructuraCorreo.destinatarios = "RegistroIntercompany;Destinatario" + cuerpoCorreo.DestinatariosCuerpo;
    this.estructuraCorreo.importante = false;
    this.estructuraCorreo.adjuntos = [];

    this.tesoreriaService.postEnvioCorreoJava(this.estructuraCorreo).subscribe(
      (response: any) => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'El ' + (this.listOC[0].t454_id_type_co == 'INTER' ? 'Intercompany' 
                          : this.listOC[0].t454_id_type_co == 'PREST' ? 'Préstamo' 
                          : this.listOC[0].t454_id_type_co == 'BONO' ? 'Bono' 
                          : '') 
                + ' ha sido registrado con éxito',
          confirmButtonText: "Aceptar",
          confirmButtonColor: '#4b822d'
        });
        this.cerrar();
      },(error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

}
