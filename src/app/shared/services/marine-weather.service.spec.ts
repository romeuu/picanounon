import { TestBed } from '@angular/core/testing';

import { MarineWeatherService } from './marine-weather.service';

describe('MarineWeatherService', () => {
  let service: MarineWeatherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarineWeatherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
