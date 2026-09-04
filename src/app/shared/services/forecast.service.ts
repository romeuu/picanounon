import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TargetSpecies } from '../../core/models/enums/species.enum';
import { TidePhase } from '../../core/models/enums/tide-phase.enum';
import { HourlyForecast } from '../../core/models/interfaces/hourly-forecast.model';
import { MarineConditions } from '../../core/models/interfaces/marine-conditions.model';
import { TideResponse } from '../../core/models/interfaces/meteo-galicia.model';
import { Port } from '../../core/models/interfaces/port';
import { isToday } from '../utils/date-utils';
import { MarineWeatherService } from './marine-weather.service';
import { ScoringService } from './scoring.service';
import { TideService } from './tide.service';

@Injectable({ providedIn: 'root' })
export class ForecastService {
  private readonly _marineWeatherService = inject(MarineWeatherService);
  private readonly _tideService = inject(TideService);
  private readonly _scoringService = inject(ScoringService);

  private destroy$ = inject(DestroyRef);

  readonly hourlyForecast = signal<HourlyForecast[]>([]);
  readonly currentForecast = signal<HourlyForecast[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadForecastForPort(port: Port, targetDate?: Date): void {
    this.isLoading.set(true);
    this.error.set(null);

    const refDate = targetDate ?? new Date();
    const targetDateStr = this.formatDateToLocalIso(refDate);

    forkJoin({
      weather: this._marineWeatherService.getForecast(port.lat, port.lng),
      tides: this._tideService
        .getTidesByPort(port.id, targetDateStr)
        .pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ weather: data, tides }) => {
        const result: HourlyForecast[] = [];

        // Atopar todos os índices de previsión que coinciden coa data seleccionada
        const matchingIndices: number[] = [];
        for (let i = 0; i < data.time.length; i++) {
          if (data.time[i].startsWith(targetDateStr)) {
            matchingIndices.push(i);
          }
        }

        // Se non se atopan pola coincidencia de data exacta, usar as primeiras 24 horas
        const indicesToProcess =
          matchingIndices.length > 0
            ? matchingIndices
            : Array.from(
                { length: Math.min(24, data.time.length) },
                (_, i) => i,
              );

        for (const i of indicesToProcess) {
          const rawTime = data.time[i];
          const dateObj = new Date(rawTime);

          // Determinar a fase de marea cos datos reais de marea se están dispoñibles
          let tidePhase = TidePhase.ENCHENTE;
          let tideHeight = 2.0;
          let isTideRising = true;

          if (tides && tides.length > 0) {
            // Atopar a marea máis próxima antes e despois do tempo actual da hora
            const itemMs = dateObj.getTime();
            const sortedTides = [...tides].sort(
              (a, b) =>
                new Date(a.tideDateTime).getTime() -
                new Date(b.tideDateTime).getTime(),
            );
            const nextIdx = sortedTides.findIndex(
              (t) => new Date(t.tideDateTime).getTime() > itemMs,
            );

            let prevTide: TideResponse;
            let nextTide: TideResponse;

            if (nextIdx > 0) {
              prevTide = sortedTides[nextIdx - 1];
              nextTide = sortedTides[nextIdx];
            } else if (nextIdx === 0) {
              // Estamos antes do primeiro evento rexistrado
              prevTide = sortedTides[0];
              nextTide = sortedTides[1] ?? sortedTides[0];
            } else {
              // Estamos despois do último evento rexistrado
              prevTide =
                sortedTides[sortedTides.length - 2] ??
                sortedTides[sortedTides.length - 1];
              nextTide = sortedTides[sortedTides.length - 1];
            }

            isTideRising = nextTide.height > prevTide.height;
            tideHeight = this._tideService.calcularAlturaMareaActual(
              prevTide,
              nextTide,
              dateObj,
            );

            // Se falta menos de 45 min para un pico de marea, consideramos ese pico
            const diffPrevMinutes =
              Math.abs(itemMs - new Date(prevTide.tideDateTime).getTime()) /
              60000;
            const diffNextMinutes =
              Math.abs(new Date(nextTide.tideDateTime).getTime() - itemMs) /
              60000;

            if (diffPrevMinutes <= 45) {
              tidePhase = prevTide.type.toLowerCase().includes('plea')
                ? TidePhase.PREAMAR
                : TidePhase.BAIXAMAR;
            } else if (diffNextMinutes <= 45) {
              tidePhase = nextTide.type.toLowerCase().includes('plea')
                ? TidePhase.PREAMAR
                : TidePhase.BAIXAMAR;
            } else {
              tidePhase = isTideRising
                ? TidePhase.ENCHENTE
                : TidePhase.MINGUANTE;
            }
          } else {
            // Fallback se non hai datos de mareas da API
            const hourNum = dateObj.getHours();
            isTideRising = hourNum % 12 < 6;
            tidePhase =
              hourNum % 12 < 6 ? TidePhase.ENCHENTE : TidePhase.MINGUANTE;
            tideHeight = 2.0;
          }

          // Cálculo dinámico de momento crepuscular (±60 min arredor de amencer e solpor)
          const timeMs = dateObj.getTime();
          let isCrepuscular = false;

          if (
            (data.sunrise && data.sunrise.length > 0) ||
            (data.sunset && data.sunset.length > 0)
          ) {
            const ONE_HOUR_MS = 60 * 60 * 1000;
            const isNearSunrise = (data.sunrise ?? []).some(
              (s) => Math.abs(timeMs - new Date(s).getTime()) <= ONE_HOUR_MS,
            );
            const isNearSunset = (data.sunset ?? []).some(
              (s) => Math.abs(timeMs - new Date(s).getTime()) <= ONE_HOUR_MS,
            );
            isCrepuscular = isNearSunrise || isNearSunset;
          } else {
            // Fallback xenérico só en caso de que falten datos solares
            const hourNum = dateObj.getHours();
            isCrepuscular =
              hourNum === 7 ||
              hourNum === 8 ||
              hourNum === 21 ||
              hourNum === 22;
          }

          const conditions: MarineConditions = {
            waveHeight: data.waveHeight[i] ?? 0,
            wavePeriod: data.wavePeriod[i] ?? 0,
            windSpeed: data.windSpeed[i] ?? 0,
            tidePhase,
            tideHeight,
            isCrepuscular,
            isDaylight: (data.isDay[i] ?? 1) === 1,
            waterTemperature: data.seaTemperature[i] ?? 15,
            temperature: data.temperature[i] ?? 20,
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
          const xardaRes = this._scoringService.calculateScore(
            conditions,
            TargetSpecies.XARDA,
          );

          result.push({
            time: rawTime.substring(11, 16),
            dateTime: rawTime,
            waveHeight: conditions.waveHeight,
            wavePeriod: conditions.wavePeriod,
            windSpeed: conditions.windSpeed,
            isSafe: sargoRes.isSafe,
            scoreSargos: sargoRes.score,
            scoreRobaliza: robalizaRes.score,
            scoreAgullas: agullaRes.score,
            scoreXardas: xardaRes.score,
            seaTemperature: conditions.waterTemperature,
            temperature: conditions.temperature,
            tideHeight,
            isTideRising,
          });
        }

        if (targetDate && isToday(targetDate)) {
          this.currentForecast.set(result);
        }

        this.hourlyForecast.set(result);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao sincronizar datos de meteo');
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
