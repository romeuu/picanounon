import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, Observable, map } from 'rxjs';
import {
  CurrentTideStatus,
  TideResponse,
} from '../../core/models/interfaces/meteo-galicia.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class TideService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/tides';

  readonly currentTides = signal<TideResponse[]>([]);
  readonly currentTideStatus = signal<CurrentTideStatus | null>(null);

  getTidesByPort(id: number, dateStr?: string): Observable<TideResponse[]> {
    const today = new Date();
    const targetDate = dateStr ?? today.toISOString().split('T')[0];

    const dateObj = new Date(targetDate);
    const nextDayObj = new Date(dateObj);
    nextDayObj.setDate(nextDayObj.getDate() + 1);
    const nextDateStr = nextDayObj.toISOString().split('T')[0];

    const currentDayUrl = `${this.API_URL}/port/${id}?date=${targetDate}`;
    const nextDayUrl = `${this.API_URL}/port/${id}?date=${nextDateStr}`;

    return forkJoin([
      this.http.get<ApiResponse<TideResponse>>(currentDayUrl),
      this.http.get<ApiResponse<TideResponse>>(nextDayUrl),
    ]).pipe(
      map(([resToday, resNextDay]) => {
        const todayTides = resToday?.data ?? [];
        const nextDayTides = resNextDay?.data ?? [];
        const combined = [...todayTides, ...nextDayTides];

        if (combined.length === 0) {
          throw new Error('Non hai datos de marea dispoñibles para este porto');
        }
        this.currentTides.set(combined);
        this.currentTideStatus.set(this.calculateCurrentDataTide(combined));
        return combined;
      }),
    );
  }

  calculateCurrentDataTide(data: TideResponse[]): CurrentTideStatus | null {
    if (!data || data.length === 0) return null;

    const now = new Date();
    const nowMs = now.getTime();

    // 1. Asegurar orde cronolóxica con timestamps absolutos
    const sortedData = [...data].sort(
      (a, b) =>
        new Date(a.tideDateTime).getTime() - new Date(b.tideDateTime).getTime(),
    );

    // 2. Atopar a primeira marea no futuro (nextTide)
    const nextIndex = sortedData.findIndex(
      (item) => new Date(item.tideDateTime).getTime() > nowMs,
    );

    let previousTide: TideResponse;
    let nextTide: TideResponse;

    if (nextIndex > 0) {
      previousTide = sortedData[nextIndex - 1];
      nextTide = sortedData[nextIndex];
    } else if (nextIndex === 0) {
      // Estamos xusto antes do primeiro evento rexistrado
      previousTide = sortedData[0];
      nextTide = sortedData[1] ?? sortedData[0];
    } else {
      // Todos os eventos do array xa pasaron
      previousTide =
        sortedData[sortedData.length - 2] ?? sortedData[sortedData.length - 1];
      nextTide = sortedData[sortedData.length - 1];
    }

    // 3. Calcular a altura instantánea
    const currentHeight = this.calcularAlturaMareaActual(
      previousTide,
      nextTide,
      now,
    );

    // 4. Determinar se a marea está subindo ou baixando
    const isRising = nextTide.height > previousTide.height;
    const status: 'SUBINDO' | 'BAIXANDO' = isRising ? 'SUBINDO' : 'BAIXANDO';

    // 5. Progreso do ciclo actual (0 a 100%)
    const prevMs = new Date(previousTide.tideDateTime).getTime();
    const nextMs = new Date(nextTide.tideDateTime).getTime();
    const progress =
      nextMs > prevMs
        ? Math.min(Math.max((nowMs - prevMs) / (nextMs - prevMs), 0), 1)
        : 0;

    const response = {
      currentHeight,
      status,
      previousTide,
      nextTide,
      progressPercentage: Math.round(progress * 100),
    };

    console.log(response);

    return response;
  }

  private calcularAlturaMareaActual(
    anterior: TideResponse,
    seguinte: TideResponse,
    agora: Date,
  ): number {
    const tInicio = new Date(anterior.tideDateTime).getTime();
    const tFin = new Date(seguinte.tideDateTime).getTime();
    const tAgora = agora.getTime();

    const duracionTotal = tFin - tInicio;
    if (duracionTotal <= 0) return anterior.height;

    const tempoTranscorrido = tAgora - tInicio;
    const progreso = Math.min(
      Math.max(tempoTranscorrido / duracionTotal, 0),
      1,
    );

    // Curva cosenoidal: varía de 0 a 1 suavemente
    const factorCoseno = (1 - Math.cos(progreso * Math.PI)) / 2;

    const altura =
      anterior.height + (seguinte.height - anterior.height) * factorCoseno;
    return Number(altura.toFixed(2));
  }
}
