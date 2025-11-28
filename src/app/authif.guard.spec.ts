import { TestBed } from '@angular/core/testing';

import { AuthifGuard } from './authif.guard';

describe('AuthifGuard', () => {
  let guard: AuthifGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthifGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
