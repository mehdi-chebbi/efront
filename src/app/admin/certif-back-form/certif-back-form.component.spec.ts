import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertifBackFormComponent } from './certif-back-form.component';

describe('CertifBackFormComponent', () => {
  let component: CertifBackFormComponent;
  let fixture: ComponentFixture<CertifBackFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertifBackFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertifBackFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
