import { TidePhase } from '../enums/tide-phase.enum';

export interface MarineConditions {
  waveHeight: number; // Altura significativa (Hs en metros)
  wavePeriod: number; // Período de pico (Tp en segundos)
  waveDirection: number; // Dirección das ondas en graos (0-360)
  windSpeed: number; // Velocidade do vento en km/h
  windDirection: number; // Dirección do vento en graos (0-360)
  tidePhase: TidePhase;
  tideHeight: number; // Altura de marea en metros
}
