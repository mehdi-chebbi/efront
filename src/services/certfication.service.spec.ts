import { TestBed } from '@angular/core/testing';

import { CertficationService } from './certfication.service';

describe('CertficationService', () => {
  let service: CertficationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CertficationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
