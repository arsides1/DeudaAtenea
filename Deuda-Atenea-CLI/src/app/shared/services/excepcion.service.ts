import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExcepcionService {

  private excepciones: any[] = [];

  constructor() { }

  getExcepciones(): any[] {
    return this.excepciones;
  }

  setExcepciones(data: any[]): void {
    this.excepciones = data;
  }

  limpiar(): void {
    this.excepciones = [];
  }

}
