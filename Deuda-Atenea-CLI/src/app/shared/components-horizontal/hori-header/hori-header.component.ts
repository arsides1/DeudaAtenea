import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TokenService } from '../../services/token.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hori-header',
  templateUrl: './hori-header.component.html',
  styleUrls: ['./hori-header.component.scss']
})
export class HoriHeaderComponent implements OnInit {
  @Output() toggleSidebarEvent = new EventEmitter<void>();

  public isCollapsed = true;
  isLogged = false;
  isGestorUsuarios = false;
  nombreUsuario = '';
  nombre = '';
  Body: any = document.querySelector('body');

  constructor(
    private tokenService: TokenService, 
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.tokenService.getToken()) {
      this.isLogged = true;
      this.nombreUsuario = this.tokenService.getNombre();
      this.nombre = this.tokenService.getNombre();
      this.isGestorUsuarios = this.tokenService.roles.some(item => item.startsWith('Gestor'));
    } else {
      this.isLogged = false;
      this.nombreUsuario = '';
    }
  }

  toggleSidebar(): void {
    this.toggleSidebarEvent.emit();
  }

  searchOpen(): void {
    this.Body?.classList.add('search-show');
  }

  search(e: any): void {
    e.preventDefault();
    this.Body?.classList.remove('search-show');
  }

  registrarUsuario(): void {
    this.router.navigate(['/auth/register-user']);
  }

  cerrarSesion(): void {
    this.tokenService.logOut();
    this.router.navigate(['/auth/login']);
  }

  iniciarSesion(): void {
    this.router.navigate(['/auth/login']);
  }
}