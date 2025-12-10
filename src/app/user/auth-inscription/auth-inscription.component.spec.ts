import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthInscriptionComponent } from './auth-inscription.component';

describe('AuthInscriptionComponent', () => {
  let component: AuthInscriptionComponent;
  let fixture: ComponentFixture<AuthInscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthInscriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthInscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
