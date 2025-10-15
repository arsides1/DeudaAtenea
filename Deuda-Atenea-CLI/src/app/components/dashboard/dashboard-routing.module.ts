import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProdGuardService as guard } from 'src/app/guards/prod-guard.service';

import { paginaInicioComponent } from './paginaInicio/paginaInicio.component';

import { RegistroIntercompaniesComponent } from './tesoreria/registro-intercompanies/registro-intercompanies.component';
import { MantenedorIntercompanyComponent } from './tesoreria/mantenedor-intercompany/mantenedor-intercompany.component';
import {RegistroDeudaComponent} from "./productos/bonos/registro-deuda/registro-deuda.component";
import { ProductosComponent } from './productos/productos.component';
import { BonosComponent } from './productos/bonos/bonos.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'paginaInicio',
        component: paginaInicioComponent
      },
      {
        path: 'MantenedorIntercompany',
        component: MantenedorIntercompanyComponent, canActivate: [guard], data: { expectedRol: ['RDT_Registro','Administrador'] }
      },
      {
        path: 'RegistroIntercompanies',
        component: RegistroIntercompaniesComponent, canActivate: [guard], data: { expectedRol: ['RDT_Registro','Administrador'] }
      },
      {
        path: 'RegistroDeuda',
        component: RegistroDeudaComponent, canActivate: [guard], data: { expectedRol: ['RDT_Registro','Administrador'] }
      },
      {
        path: 'Registro',
        component: BonosComponent, canActivate: [guard], data: { expectedRol: ['RDT_Registro','Administrador'] }
      },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
