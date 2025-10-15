import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenedorIntercompanyComponent } from './mantenedor-intercompany.component';

describe('MantenedorIntercompanyComponent', () => {
  let component: MantenedorIntercompanyComponent;
  let fixture: ComponentFixture<MantenedorIntercompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MantenedorIntercompanyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MantenedorIntercompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
