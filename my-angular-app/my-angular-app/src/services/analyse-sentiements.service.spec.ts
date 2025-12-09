import { TestBed } from '@angular/core/testing';

import { AnalyseSentiementsService } from './analyse-sentiements.service';

describe('AnalyseSentiementsService', () => {
  let service: AnalyseSentiementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalyseSentiementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
