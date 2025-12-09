import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertifBackComponent } from './certif-back.component';

describe('CertifBackComponent', () => {
  let component: CertifBackComponent;
  let fixture: ComponentFixture<CertifBackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertifBackComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertifBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
