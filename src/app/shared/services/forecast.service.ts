import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TargetSpecies } from '../../core/models/enums/species.enum';
import {
  DayForecastResponse,
  HourlyForecast,
} from '../../core/models/interfaces/hourly-forecast.model';
import { Port } from '../../core/models/interfaces/port';
import { ApiResponse } from '../models/api-response.model';
import { isToday } from '../utils/date-utils';
import { TideService } from './tide.service';

@Injectable({ providedIn: 'root' })
export class ForecastService {
  private readonly http = inject(HttpClient);
  private readonly _tideService = inject(TideService);

  readonly hourlyForecast = signal<HourlyForecast[]>([]);
  readonly currentForecast = signal<HourlyForecast[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadForecastForPort(
    port: Port,
    targetDate?: Date,
    species: TargetSpecies = TargetSpecies.SARGOS,
  ): void {
    this.isLoading.set(true);
    this.error.set(null);

    const refDate = targetDate ?? new Date();
    const targetDateStr = this.formatDateToLocalIso(refDate);

    const forecastUrl = `/api/forecast/port/${port.id}?date=${targetDateStr}&species=${species}`;

    forkJoin({
      forecastRes: this.http.get<ApiResponse<DayForecastResponse>>(forecastUrl),
      tides: this._tideService
        .getTidesByPort(port.id, targetDateStr)
        .pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ forecastRes }) => {
        const result = forecastRes?.data?.hourlyForecasts ?? [];

        if (targetDate && isToday(targetDate)) {
          this.currentForecast.set(result);
        }

        this.hourlyForecast.set(result);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao sincronizar datos de previsión');
        this.isLoading.set(false);
      },
    });
  }

  private formatDateToLocalIso(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}