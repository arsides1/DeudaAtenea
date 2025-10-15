import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { VertMenuComponent } from '../../components-horizontal/vert-menu/vert-menu.component';

@Component({
  selector: 'app-hori-full-layout',
  templateUrl: './hori-full-layout.component.html',
  styleUrls: ['./hori-full-layout.component.scss']
})
export class HoriFullLayoutComponent implements OnInit {
  @ViewChild(VertMenuComponent) vertMenu: VertMenuComponent;
  
  isMenuCollapsed = false;
  private routerSubscription: Subscription;
  private documentClickListener: Function;

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Verificar el estado guardado del menú
    const savedState = localStorage.getItem('menuCollapsed');
    if (savedState) {
      this.isMenuCollapsed = savedState === 'true';
    }

    // Suscribirse a eventos de navegación para colapsar el menú
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Colapsar menú cuando cambia la ruta
        if (!this.isMenuCollapsed) {
          this.isMenuCollapsed = true;
          localStorage.setItem('menuCollapsed', 'true');
        }
      });
      
    // Agregar listener global para clicks en el documento
    this.documentClickListener = this.renderer.listen('document', 'click', (event) => {
      this.handleDocumentClick(event);
    });
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones para evitar memory leaks
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    
    // Remover listener de documento
    if (this.documentClickListener) {
      this.documentClickListener();
    }
  }

  // Función para manejar clicks en cualquier parte del documento
  handleDocumentClick(event: MouseEvent): void {
    // Verificar si el menú está expandido y el clic fue fuera del menú
    if (!this.isMenuCollapsed) {
      // Obtener el elemento del menú
      const menuElement = this.elementRef.nativeElement.querySelector('.vertical-menu');
      
      // Si el clic fue fuera del menú
      if (menuElement && !menuElement.contains(event.target as Node)) {
        this.isMenuCollapsed = true;
        localStorage.setItem('menuCollapsed', 'true');
      }
    }
  }

  toggleSidebar(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    // Guardar estado del menú
    localStorage.setItem('menuCollapsed', this.isMenuCollapsed.toString());
  }

  clickonBody(): void {
    // Remover clase search-show
    let Body: any = document.querySelector('body');
    Body?.classList.remove('search-show');
  }
}