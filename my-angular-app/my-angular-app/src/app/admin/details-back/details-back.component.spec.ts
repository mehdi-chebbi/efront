import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsBackComponent } from './details-back.component';

describe('DetailsBackComponent', () => {
  let component: DetailsBackComponent;
  let fixture: ComponentFixture<DetailsBackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsBackComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
