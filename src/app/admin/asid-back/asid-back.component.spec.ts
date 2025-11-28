import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsidBackComponent } from './asid-back.component';

describe('AsidBackComponent', () => {
  let component: AsidBackComponent;
  let fixture: ComponentFixture<AsidBackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsidBackComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsidBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
