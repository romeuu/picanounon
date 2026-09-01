import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

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
  private readonly URL = 'https://marine-api.open-meteo.com/v1/marine';
  private readonly MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine';
  private readonly WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

  getForecast(lat: number, lng: number): Observable<RawMarineWeatherData> {
    const marineParams = new HttpParams()
      .set('latitude', lat.toString())
      .set('longitude', lng.toString())
      .set('hourly', 'wave_height,wave_period,sea_surface_temperature')
      .set('timezone', 'Europe/Madrid')
      .set('forecast_days', '7');

    const weatherParams = new HttpParams()
      .set('latitude', lat.toString())
      .set('longitude', lng.toString())
      .set('hourly', 'wind_speed_10m,is_day,temperature_2m')
      .set('daily', 'sunrise,sunset')
      .set('timezone', 'Europe/Madrid')
      .set('forecast_days', '7');

    return forkJoin({
      marine: this.http.get<any>(this.MARINE_URL, { params: marineParams }),
      weather: this.http.get<any>(this.WEATHER_URL, { params: weatherParams }),
    }).pipe(
      map(({ marine, weather }) => ({
        time: marine.hourly.time,
        waveHeight: marine.hourly.wave_height,
        wavePeriod: marine.hourly.wave_period,
        windSpeed: weather.hourly.wind_speed_10m,
        isDay: weather.hourly.is_day,
        sunrise: weather.daily?.sunrise ?? [],
        sunset: weather.daily?.sunset ?? [],
        seaTemperature: marine.hourly.sea_surface_temperature ?? [],
        temperature: weather.hourly.temperature_2m ?? [],
      })),
    );
  }
}
