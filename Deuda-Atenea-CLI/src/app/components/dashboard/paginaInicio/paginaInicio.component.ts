import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit,ViewChild, Input, Output, OnChanges, SimpleChanges, ElementRef, Directive, HostListener } from '@angular/core';
import {NgbDateStruct, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EventEmitter } from '@angular/core';
import { Observable, pipe, Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/shared/services/token.service';

@Component({
  
  selector: 'app-paginaInicio',
  templateUrl: './paginaInicio.component.html',
  styleUrls: ['./paginaInicio.component.scss']

  
})

export class paginaInicioComponent implements OnInit {

 // Variables para el usuario
 public usuario: string = '';
  
 // Variables para el contenido animado
 public showContent: boolean = false;
 
 // Variables para la fecha actual
 public currentYear: number = new Date().getFullYear();
 
 // Link de correo preconfigurado para Outlook
 public mailtoLink: string = '';

 constructor(
   private router: Router,
   private tokenService: TokenService
 ) { }

 ngOnInit(): void {
   // Obtenemos el usuario del servicio
   this.usuario = this.tokenService.getNombre(); //this.portafolioMoliendaIFDService.usuario;
   
   // Si no hay usuario, mostramos un valor por defecto
   if (!this.usuario || this.usuario.trim() === '') {
     this.usuario = 'Usuario';
   }
   
   // Configuramos el link de correo con información adicional
   this.configurarMailtoLink();
 }

 /**
  * Configura el link mailto con información adicional para Outlook
  */
 private configurarMailtoLink(): void {
   const subject = encodeURIComponent('Sugerencia para ATENEA');
   const body = encodeURIComponent(`Hola equipo de ATENEA,

Me gustaría compartir la siguiente sugerencia:

[Tu sugerencia aquí]

Saludos,
${this.usuario}`);
   
   this.mailtoLink = `mailto:atenea@alicorp.com.pe?subject=${subject}&body=${body}`;
 }

 /**
  * Alterna la visibilidad del contenido animado
  */
 public toggleContent(): void {
   this.showContent = !this.showContent;
 }

 /**
  * Navega al módulo de molienda
  */
 public abrirModuloMolienda(): void {
   this.router.navigate(['/ventasMolienda']);
 }

 /**
  * Navega al módulo de derivados
  */
 public abrirModuloDerivado(): void {
   this.router.navigate(['/PortafolioDerivado']);
 }

 /**
  * Navega al módulo de tesorería
  */
 public abrirModuloTesoreria(): void {
   this.router.navigate(['/PortafolioDerivado']);
 }

 /**
  * Maneja los eventos de teclado para cerrar contenido con Escape
  */
 @HostListener('document:keydown.escape', ['$event'])
 public handleEscapeKey(event: KeyboardEvent): void {
   if (this.showContent) {
     this.showContent = false;
   }
 }

}









