import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DebtScheduleRequest } from 'src/app/models/Tesoreria/Deuda/models';

@Component({
  selector: 'app-prepagos',
  templateUrl: './prepagos.component.html',
  styleUrls: ['./prepagos.component.scss']
})
export class PrepagosComponent implements OnInit {

  displayedColumnsPrepago: string[] = ['prepaidType', 'rated', 'resultado', ''];

  debtForm: FormGroup;
  schedules: DebtScheduleRequest[] = [];

  constructor( private fb: FormBuilder,) {  this.debtForm = this.createForm();}

  private createForm(): FormGroup {
     return this.fb.group({
      prepaymentType: [''], prepaymentAmount: [''], prepaymentDate: [''], previousPaymentDate: [''], nextInterestRate:['']
     });
  }

  ngOnInit(): void {
  }

}
