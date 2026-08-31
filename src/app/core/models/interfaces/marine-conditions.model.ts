import { TidePhase } from '../enums/tide-phase.enum';

export interface MarineConditions {
  waveHeight: number; // Altura significativa da vaga (Hs en metros)
  wavePeriod: number; // Período de pico (Tp en segundos)
  windSpeed: number; // Velocidade do vento en km/h
  tidePhase: TidePhase;
  tideHeight?: number; // Altura instantánea da marea en metros
  tideStatus?: 'SUBINDO' | 'BAIXANDO';
  isCrepuscular: boolean; // Amencer ou serán
  isDaylight: boolean;
}

