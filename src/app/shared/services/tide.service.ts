import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  MeteoGaliciaDayResponse,
  MeteoGaliciaResponse,
} from '../../core/models/interfaces/meteo-galicia.model';

@Injectable({
  providedIn: 'root',
})
export class TideService {
  private http = inject(HttpClient);
  private readonly BASE_URL =
    'https://servizos.meteogalicia.gal/mgrss/predicion/mareas/jsonMareas.action';

  getTidesByPort(
    idPortoMG: number,
    dateStr?: string,
  ): Observable<MeteoGaliciaDayResponse> {
    const targetDate = dateStr ?? new Date().toISOString().split('T')[0];
    const url = `${this.BASE_URL}?idPorto=${idPortoMG}&data=${targetDate}`;

    return this.http.get<MeteoGaliciaResponse>(url).pipe(
      map((res) => {
        const listaMareas = res?.mareas[0].listaMareas;
        if (!listaMareas)
          throw new Error('Non hai datos de marea dispoñibles para este porto');
        return res?.mareas[0];
      }),
    );
  }
}
