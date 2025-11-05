import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DebtDetail, DebtScheduleRequest } from 'src/app/models/Tesoreria/Deuda/models';
import { DeudaService } from 'src/app/shared/services/deuda.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-prepagos',
  templateUrl: './prepagos.component.html',
  styleUrls: ['./prepagos.component.scss']
})
export class PrepagosComponent implements OnInit {

  @Input() data: { debt: DebtDetail; schedules: DebtScheduleRequest[] };
  @Output() close = new EventEmitter<boolean>();

  prepaymentForm: FormGroup;
  debtForm: FormGroup;
  schedulesGrid: DebtScheduleRequest[] = [];

  constructor(
    private fb: FormBuilder,
    private deudaService: DeudaService,
    private modalService: NgbModal  // ← IGUAL QUE REGISTRO-DEUDA
  ) {
    this.prepaymentForm = this.createForm();
  }

  ngOnInit(): void {
    console.log("En PREPAGO", this.data.schedules);
  }

  private createForm(): FormGroup {
    return this.fb.group({
      prepaymentDate: [null, Validators.required],
      prepaymentType: ['', Validators.required],
      prepaymentAmount: [null, [Validators.required, Validators.min(0)]],
      prepaymentInterest: [{ value: null, disabled: true }],
      previousPaymentDate: [null],
      nextInterestRate: [null],
      prepaidInstallmentAmount: [null]
    });
  }

  /**
   * ✅ FUNCIÓN CORREGIDA - Calcula la tasa e interés del prepago
   */
  obtenerTasa() {
    const fechaPrepago: Date = new Date(this.prepaymentForm.get('prepaymentDate')!.value);
    const dateFP = this.dateToNumber(fechaPrepago);

    console.log("📅 Fecha prepago:", dateFP);

    // 1. Ordenar cronograma por fecha
    const schedulesOrdenados = [...this.data.schedules].sort((a, b) =>
      (a.paymentDate || 0) - (b.paymentDate || 0)
    );

    console.log("📊 Cronograma ordenado:", schedulesOrdenados);

    // 2. Encontrar entre qué cuotas cae el prepago
    let cuotaAnterior: DebtScheduleRequest | null = null;
    let cuotaSiguiente: DebtScheduleRequest | null = null;

    for (let i = 0; i < schedulesOrdenados.length; i++) {
      const schedule = schedulesOrdenados[i];
      const fechaCuota = schedule.paymentDate || 0;

      if (fechaCuota < dateFP) {
        cuotaAnterior = schedule;
      } else if (fechaCuota >= dateFP && !cuotaSiguiente) {
        cuotaSiguiente = schedule;
        break;
      }
    }

    console.log("⬅️ Cuota anterior:", cuotaAnterior);
    console.log("➡️ Cuota siguiente:", cuotaSiguiente);

    // 3. Determinar la tasa aplicable
    let tasaAplicable = 0;
    let fechaAnterior = 0;

    if (cuotaSiguiente) {
      tasaAplicable = cuotaSiguiente.rate || 0;
      fechaAnterior = cuotaAnterior ? (cuotaAnterior.paymentDate || 0) : dateFP;
    } else if (cuotaAnterior) {
      tasaAplicable = cuotaAnterior.rate || 0;
      fechaAnterior = cuotaAnterior.paymentDate || 0;
    } else {
      tasaAplicable = this.data.debt.fixedRatePercentage || 0;
      fechaAnterior = this.dateToNumber(new Date(this.data.debt.disbursementDate || new Date()));
    }

    console.log("💰 Tasa aplicable:", tasaAplicable);

    // 4. Calcular días entre fecha anterior y prepago
    const dias = this.calcularDias(fechaAnterior, dateFP);
    console.log("📆 Días:", dias);

    // 5. Calcular interés del prepago
    const montoAmortizacion = this.prepaymentForm.get('prepaymentAmount')?.value || 0;
    const saldoActual = cuotaAnterior?.nominalClosing || this.data.debt.nominal || 0;

    const interes = saldoActual * (tasaAplicable / 100) * (dias / 360);

    console.log("💵 Interés calculado:", interes);
    console.log("💰 Saldo actual:", saldoActual);

    // 6. Actualizar campos del formulario
    this.prepaymentForm.patchValue({
      prepaymentInterest: interes,
      previousPaymentDate: this.numberToDate(fechaAnterior),
      nextInterestRate: tasaAplicable,
      prepaidInstallmentAmount: montoAmortizacion + interes
    }, { emitEvent: false });

    return {
      tasa: tasaAplicable,
      interes: interes,
      dias: dias,
      fechaAnterior: fechaAnterior,
      cuotaAnterior: cuotaAnterior,
      cuotaSiguiente: cuotaSiguiente
    };
  }

  /**
   * Calcula días entre dos fechas (formato YYYYMMDD)
   */
  private calcularDias(fechaInicio: number, fechaFin: number): number {
    const inicio = this.numberToDate(fechaInicio);
    const fin = this.numberToDate(fechaFin);

    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Convierte número YYYYMMDD a Date
   */
  private numberToDate(dateNumber: number): Date {
    const dateStr = dateNumber.toString();
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
  }

  /**
   * ✅ CERRAR - IGUAL QUE REGISTRO-DEUDA
   */
  cerrar(): void {
    this.close.emit(true);
    this.modalService.dismissAll();
  }

  /**
   * ✅ GUARDAR PREPAGO
   */
  guardarPrepago() {
    if (this.prepaymentForm.valid) {
      const resultado = this.obtenerTasa();

      console.log("💾 Guardando prepago con resultado:", resultado);

      // Emitir evento al padre y cerrar
      this.close.emit(true);
      this.modalService.dismissAll();
    } else {
      console.warn('Formulario inválido');
      Object.keys(this.prepaymentForm.controls).forEach(key => {
        this.prepaymentForm.get(key)?.markAsTouched();
      });
    }
  }

  formatearValorNumeric(event: any, esConComas: boolean): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9.]/g, '');

    if (!value || value === '' || value === '.') {
      input.value = '';
      const fieldName = input.getAttribute('formControlName');
      if (fieldName) {
        this.prepaymentForm.get(fieldName)?.setValue(null);
      }
      return;
    }

    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    const fieldName = input.getAttribute('formControlName');

    if (fieldName) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        this.prepaymentForm.get(fieldName)?.setValue(numericValue, { emitEvent: false });

        if (esConComas) {
          const formatted = numericValue.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: parts[1]?.length || 0
          });
          input.value = formatted;
        } else {
          input.value = value;
        }
      }
    }
  }

  private dateToNumber(date: Date): number {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return parseInt(`${year}${month}${day}`);
  }
}
