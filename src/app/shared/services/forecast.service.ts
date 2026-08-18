import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { TargetSpecies } from '../../core/models/enums/species.enum';
import { TidePhase } from '../../core/models/enums/tide-phase.enum';
import { HourlyForecast } from '../../core/models/interfaces/hourly-forecast.model';
import { MarineConditions } from '../../core/models/interfaces/marine-conditions.model';
import { Port } from '../../core/models/interfaces/port';
import { MarineWeatherService } from './marine-weather.service';
import { ScoringService } from './scoring.service';

@Injectable({ providedIn: 'root' })
export class ForecastService {
  private readonly _marineWeatherService = inject(MarineWeatherService);
  private readonly _scoringService = inject(ScoringService);

  private destroy$ = inject(DestroyRef);

  readonly hourlyForecast = signal<HourlyForecast[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadForecastForPort(port: Port): void {
    this.isLoading.set(true);
    this.error.set(null);

    this._marineWeatherService.getForecast(port.lat, port.lng).subscribe({
      next: (data) => {
        const result: HourlyForecast[] = [];
        const totalHours = Math.min(24, data.time.length);

        for (let i = 0; i < totalHours; i++) {
          const rawTime = data.time[i];
          const hourNum = new Date(rawTime).getHours();

          const conditions: MarineConditions = {
            waveHeight: data.waveHeight[i] ?? 0,
            wavePeriod: data.wavePeriod[i] ?? 0,
            windSpeed: data.windSpeed[i] ?? 0,
            tidePhase:
              hourNum % 12 < 6 ? TidePhase.ENCHENTE : TidePhase.PREAMAR,
            isCrepuscular:
              hourNum === 7 ||
              hourNum === 8 ||
              hourNum === 21 ||
              hourNum === 22,
            isDaylight: (data.isDay[i] ?? 1) === 1,
          };

          const sargoRes = this._scoringService.calculateScore(
            conditions,
            TargetSpecies.SARGOS,
          );
          const robalizaRes = this._scoringService.calculateScore(
            conditions,
            TargetSpecies.ROBALIZA,
          );
          const agullaRes = this._scoringService.calculateScore(
            conditions,
            TargetSpecies.AGULLAS,
          );

          result.push({
            time: rawTime.substring(11, 16),
            waveHeight: conditions.waveHeight,
            wavePeriod: conditions.wavePeriod,
            windSpeed: conditions.windSpeed,
            isSafe: sargoRes.isSafe,
            scoreSargos: sargoRes.score,
            scoreRobaliza: robalizaRes.score,
            scoreAgullas: agullaRes.score,
          });
        }

        this.hourlyForecast.set(result);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao sincronizar datos de Open-Meteo');
        this.isLoading.set(false);
      },
    });
  }
}
