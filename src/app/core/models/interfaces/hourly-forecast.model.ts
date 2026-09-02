export interface HourlyForecast {
  time: string;
  dateTime?: string;
  waveHeight: number;
  wavePeriod: number;
  windSpeed: number;
  isSafe: boolean;
  scoreSargos: number;
  scoreRobaliza: number;
  scoreAgullas: number;
  scoreXardas: number;
  seaTemperature: number;
  temperature: number;
  tideHeight?: number;
  isTideRising?: boolean;
}
