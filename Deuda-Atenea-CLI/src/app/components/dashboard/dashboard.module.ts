import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgSelectModule } from '@ng-select/ng-select';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatMenuModule } from '@angular/material/menu';
// Import angular-fusioncharts
import { FusionChartsModule } from 'angular-fusioncharts';

// Import FusionCharts library and chart modules
import * as FusionCharts from 'fusioncharts';

// For Powercharts , Widgets, and Maps
import * as PowerCharts from 'fusioncharts/fusioncharts.vml';
import * as Maps from 'fusioncharts/fusioncharts.maps';

// Import timeseries
// Pass the fusioncharts library and chart modules
import * as world from 'fusioncharts/maps/fusioncharts.world';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { NgApexchartsModule } from 'ng-apexcharts';

import { ChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper'
import { DragDropModule } from '@angular/cdk/drag-drop';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';


import { MatTableExporterModule } from "mat-table-exporter";

import { paginaInicioComponent } from './paginaInicio/paginaInicio.component';
import { InterceptorService } from '../interceptor.service';
import { AppComponent } from 'src/app/app.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { MatTooltipModule } from '@angular/material/tooltip';

import { ToastrModule, ToastrService } from 'ngx-toastr';
import { DropzoneConfigInterface, DropzoneModule, DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';

import { CdkTableModule } from '@angular/cdk/table';

import { MatTreeModule } from '@angular/material/tree';

import { RegistroIntercompaniesComponent } from './tesoreria/registro-intercompanies/registro-intercompanies.component';
import { RegistroIntercompaniesCuponeraComponent } from './tesoreria/registro-intercompanies-cuponera/registro-intercompanies-cuponera.component';

import { MatExpansionModule } from '@angular/material/expansion';

import { PowerBIEmbedModule } from 'powerbi-client-angular';

import { MantenedorIntercompanyComponent } from './tesoreria/mantenedor-intercompany/mantenedor-intercompany.component';
import { EditarIntercompanyComponent } from './tesoreria/editar-intercompany/editar-intercompany.component';

import { EmptyValuePipe } from 'src/app/shared/empty-value.pipe';
import { RegistroDeudaComponent } from './productos/bonos/registro-deuda/registro-deuda.component';
import { MatRadioModule } from "@angular/material/radio";
import { CronogramaComponent } from './productos/bonos/cronograma/cronograma.component';
import { ExcepcionComponent } from './productos/bonos/excepcion/excepcion.component';
import { ProductosComponent } from './productos/productos.component';
import { BonosComponent } from './productos/bonos/bonos.component';


FusionChartsModule.fcRoot(FusionCharts, Maps, PowerCharts, world);

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  url: 'https://httpbin.org/post',
  maxFilesize: 50,
  acceptedFiles: 'image/*'
};
@NgModule({
  declarations: [
    paginaInicioComponent,
    RegistroIntercompaniesComponent,
    RegistroIntercompaniesCuponeraComponent,
    MantenedorIntercompanyComponent,
    EditarIntercompanyComponent,
    EmptyValuePipe,
    RegistroDeudaComponent,
    CronogramaComponent,
    ExcepcionComponent,
    ProductosComponent,
    BonosComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    NgbModule,
    NgSelectModule,
    ReactiveFormsModule,
    NgxDaterangepickerMd.forRoot(),
    NgApexchartsModule,
    NgCircleProgressModule.forRoot(),
    FusionChartsModule,
    ChartsModule,
    MatSelectModule,
    MatProgressBarModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    CarouselModule,
    MatTreeModule,
    MatExpansionModule,
    MatMenuModule,
    MatStepperModule,
    DragDropModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatBadgeModule,
    MatIconModule,
    MatDialogModule,
    MatCheckboxModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    MatTableExporterModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    DragDropModule,
    CdkTableModule,
    MatTooltipModule,
    ToastrModule.forRoot(),
    MatTabsModule,
    PowerBIEmbedModule,
    MatRadioModule
  ],
  exports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatBadgeModule,
    MatIconModule,
    MatDialogModule,
    MatCheckboxModule,
    MatInputModule,
    NgxSpinnerModule,
    MatTableExporterModule,
    DragDropModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en' },
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    ToastrService,
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    },
  ],
  bootstrap: [AppComponent]
})
export class DashboardModule {
}