import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DebtDetail, DebtScheduleRequest } from 'src/app/models/Tesoreria/Deuda/models';
import { DeudaService } from 'src/app/shared/services/deuda.service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialogRef } from '@angular/material/dialog';
import { CalculosDeudaService } from 'src/app/shared/services/calculos-deuda.service';

@Component({
  selector: 'app-prepagos',
  templateUrl: './prepagos.component.html',
  styleUrls: ['./prepagos.component.scss']
})
export class PrepagosComponent implements OnInit {

  @Input() data: { debt: DebtDetail; schedules: DebtScheduleRequest[] };

  @Output() close = new EventEmitter<boolean>();


  /*fieldsPrepayment: any[] = [
    {
      prepaymentDate: [''], //--> Fecha de Prepago
      prepaymentType: [''], //--> Tipo de prepago
      prepaymentAmount: [''],  //--> Monto Prepaoago
      prepaymentInterest: [''], //--> Interes del prepago (calculado)
      previousPaymentDate: [''], //--> Fecha de cuota anterior
      nextInterestRate:[''], //--> Tasa de cuota siguiente
      prepaidInstallmentAmount: [''] //--> Monto de Cuota Prepagada
    }
  ]*/

  prepaymentForm: FormGroup;
  debtForm: FormGroup;
  schedulesGrid: DebtScheduleRequest[] = [];

  

  constructor(
    private fb: FormBuilder,
    private deudaService: DeudaService,
    private modalService: NgbModal
  ) { this.prepaymentForm = this.createForm();}

 
  ngOnInit(): void {
      console.log("En PREPAGO", this.data.schedules)
  }

  private createForm(): FormGroup{
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

  obtenerTasa(){
    const fechaPrepago: Date = new Date(this.prepaymentForm.get('prepaymentDate')!.value);
    const dateFP = this.dateToNumber(fechaPrepago)
    console.log("obteberTasa",dateFP )

    const filaPrepago = {
      paymentDate: dateFP,
      tasa: null // puedes ajustar si necesitas más campos
    };
    const schedulesExtendidos = [...this.data.schedules, filaPrepago];
    console.log("NUEVO CRONNOGRAMA", schedulesExtendidos)

    // Ordenar por fecha ascendente
    /*const ordenados = schedulesExtendidos.sort((a, b) =>
      new Date(a.paymentDate) > new Date(b.paymentDate) ? 1 : -1
    );*/


  }

  cerrar(){

  }

  guardarPrepago(){
    this.obtenerTasa();
  }

  formatearValorNumeric(event: any, esConComas: boolean): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9.]/g, '');

    if (!value || value === '' || value === '.') {
      input.value = '';
      const fieldName = input.getAttribute('formControlName');
      if (fieldName) {
        this.debtForm.get(fieldName)?.setValue(null);
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
        this.debtForm.get(fieldName)?.setValue(numericValue, { emitEvent: false });

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
