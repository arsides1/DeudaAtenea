import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarIntercompanyComponent } from './editar-intercompany.component';

describe('EditarIntercompanyComponent', () => {
  let component: EditarIntercompanyComponent;
  let fixture: ComponentFixture<EditarIntercompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarIntercompanyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarIntercompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
