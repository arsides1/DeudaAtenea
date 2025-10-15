import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroIntercompaniesCuponeraComponent } from './registro-intercompanies-cuponera.component';

describe('RegistroIntercompaniesCuponeraComponent', () => {
  let component: RegistroIntercompaniesCuponeraComponent;
  let fixture: ComponentFixture<RegistroIntercompaniesCuponeraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroIntercompaniesCuponeraComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroIntercompaniesCuponeraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
