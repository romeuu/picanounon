import { TestBed } from '@angular/core/testing';

import { TideService } from './tide.service';

describe('TideService', () => {
  let service: TideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
