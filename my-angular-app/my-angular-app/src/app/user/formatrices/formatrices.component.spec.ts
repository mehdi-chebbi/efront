import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatricesComponent } from './formatrices.component';

describe('FormatricesComponent', () => {
  let component: FormatricesComponent;
  let fixture: ComponentFixture<FormatricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormatricesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormatricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
