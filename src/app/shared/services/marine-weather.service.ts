import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface RawMarineWeatherData {
  time: string[];
  waveHeight: number[];
  wavePeriod: number[];
  windSpeed: number[];
  isDay: number[];
  sunrise?: string[];
  sunset?: string[];
  seaTemperature: number[];
  temperature: number[];
}

@Injectable({ providedIn: 'root' })
export class MarineWeatherService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/weather/forecast';

  getForecast(lat: number, lng: number): Observable<RawMarineWeatherData> {
    const params = new HttpParams().set('lat', lat).set('lng', lng);
    return this.http
      .get<ApiResponse<RawMarineWeatherData>>(this.API_URL, {
        params: params,
      })
      .pipe(map((res) => res.data));
  }
}
