import { Component, OnInit } from '@angular/core';
import { TipoOC } from 'src/app/models/Tesoreria/tipoOC';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit {

  public listTipoOC: TipoOC[] = [
    { t445_id: "PBC", t445_description: "Préstamos bancarios corto plazo", t445_status: true },
    { t445_id: "PBL", t445_description: "Préstamos bancarios largo plazo", t445_status: true },
    { t445_id: "IPC", t445_description: "Préstamos intercompany corto plazo", t445_status: true },
    { t445_id: "IPL", t445_description: "Préstamos intercompany largo plazo", t445_status: true },
    { t445_id: "PAC", t445_description: "Pagarés bancarios corto plazo", t445_status: true },
    { t445_id: "PAL", t445_description: "Pagarés bancarios largo plazo", t445_status: true },
    { t445_id: "BON", t445_description: "Bonos", t445_status: true },
    { t445_id: "IMP", t445_description: "Financiamiento de importación", t445_status: true },
    { t445_id: "LEA", t445_description: "Leasing", t445_status: true },
    { t445_id: "PAP", t445_description: "Papeles Comerciales", t445_status: true }
  ];
  
  public idTipoOC: string = "BON";
  
  constructor() { }

  ngOnInit(): void {
    this.inicializarVariables();
  }

  inicializarVariables() {
    console.log("Seleccionado:", this.idTipoOC);
  }

}
