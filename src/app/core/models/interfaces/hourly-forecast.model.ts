import { SafetyLevel } from '../enums/safety-level.enum';
import { TargetSpecies } from '../enums/species.enum';
import { TidePhase } from '../enums/tide-phase.enum';

export interface HourlyForecast {
  time: string;
  dateTime?: string;
  waveHeight: number;
  wavePeriod: number;
  windSpeed: number;
  seaTemperature: number;
  temperature: number;
  tideHeight?: number;
  tideCoefficient?: number;
  isTideRising?: boolean;
  tidePhase?: TidePhase;
  isSafe: boolean;
  safetyLevel?: SafetyLevel;
  score?: number;
  verdict?: string;
  scoreSargos: number;
  scoreRobaliza: number;
  scoreAgullas: number;
  scoreXardas: number;
}

export interface DayForecastResponse {
  portId: number;
  portName: string;
  date: string;
  selectedSpecies: TargetSpecies;
  dailyCoefficient?: number;
  cycleCoefficients?: number[];
  hourlyForecasts: HourlyForecast[];
}