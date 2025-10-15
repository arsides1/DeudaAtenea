import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ExcepcionService } from 'src/app/shared/services/excepcion.service';

@Component({
  selector: 'app-excepcion',
  templateUrl: './excepcion.component.html',
  styleUrls: ['./excepcion.component.scss']
})
export class ExcepcionComponent implements OnInit {

  displayedColumnsExc: string[] = ['cuota', 'tasa', 'resultado', 'acciones'];

  excepciones: any[] = [
    { cuota: null, tasa: null, resultado: null }
  ];

  dsExcepciones = new MatTableDataSource(this.excepciones);
  excepcionesGuardadas: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<ExcepcionComponent>,
    private excepcionesService: ExcepcionService,
  ) { }


  ngOnInit(): void {
    const saved = this.excepcionesService.getExcepciones();

    if (saved && saved.length > 0) {
      this.excepciones = [...saved];
    } else {
      this.excepciones = [{ cuota: null, tasa: null, resultado: null }];
    }

    this.dsExcepciones.data = this.excepciones;
  }

  cerrar() {
    this.dialogRef.close(null);
  }

  recalcular(index: number, event: any, esConComas: boolean = false, tipo: 'cuota' | 'tasa'): void {
    const ex = this.excepciones[index];
    const input = event.target as HTMLInputElement;
    let value = input.value;

    if (tipo === 'cuota') {
      value = value.replace(/[^0-9]/g, '');
      const cuotaNum = parseInt(value || '0', 10);

      ex.cuota = cuotaNum || null;
      input.value = value;

    } else if (tipo === 'tasa') {
      value = value.replace(/[^0-9.]/g, '');
      const parts = value.split('.');
      if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');

      let tasaNum = parseFloat(value) || 0;

      if (tasaNum > 100) tasaNum = 100;
      if (tasaNum < 0) tasaNum = 0;

      ex.tasa = tasaNum;
      input.value = tasaNum.toString();
    }

    const cuotaNum = parseFloat(ex.cuota ?? '') || 0;
    const tasaNum = parseFloat(ex.tasa ?? '') || 0;
    ex.resultado = (cuotaNum && tasaNum) ? (tasaNum / cuotaNum).toFixed(2) : null;

    this.dsExcepciones.data = [...this.excepciones];
  }



  agregarExcepcion() {
    this.excepciones.push({ cuota: null, tasa: null, resultado: null });
    this.dsExcepciones.data = [...this.excepciones];
  }

  eliminarExcepcion(index: number) {
    this.excepciones.splice(index, 1);
    this.dsExcepciones.data = [...this.excepciones];
  }

  guardarExcepciones() {
    const guardadas = this.excepciones.filter(e => e.cuota != null && e.tasa != null);

    this.excepcionesGuardadas = [...guardadas];
    this.excepcionesService.setExcepciones(guardadas);

    this.dsExcepciones.data = [...this.excepciones];

    this.dialogRef.close(guardadas);
  }

}