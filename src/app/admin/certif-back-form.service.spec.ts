import { TestBed } from '@angular/core/testing';

import { CertifBackFormService } from './certif-back-form.service';

describe('CertifBackFormService', () => {
  let service: CertifBackFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CertifBackFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
