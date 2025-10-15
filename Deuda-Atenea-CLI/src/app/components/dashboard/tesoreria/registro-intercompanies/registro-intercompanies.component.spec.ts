import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroIntercompaniesComponent } from './registro-intercompanies.component';

describe('RegistroIntercompaniesComponent', () => {
  let component: RegistroIntercompaniesComponent;
  let fixture: ComponentFixture<RegistroIntercompaniesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroIntercompaniesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroIntercompaniesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
