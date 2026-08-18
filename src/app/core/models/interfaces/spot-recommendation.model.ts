import { SafetyLevel } from '../enums/safety-level.enum';

export interface SpotRecommendation {
  score: number; // 0 a 100
  safety: SafetyLevel;
  waveEnergyKw: number; // kW/m lineais de costa
  safetyPenalty: number; // Factor multiplicador (0.0 a 1.0)
  verdict: string;
}

export interface SimpleConditions {
  waveHeight: number;
  wavePeriod: number;
  windSpeed: number;
}

export interface SimpleScoreResult {
  score: number;
  isSafe: boolean;
  verdict: string;
}
