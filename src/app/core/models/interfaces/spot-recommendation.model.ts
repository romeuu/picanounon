import { SafetyLevel } from '../enums/safety-level.enum';
import { TargetSpecies } from '../enums/species.enum';
import { Port } from '../port';

export interface SpotRecommendation {
  port: Port;
  species: TargetSpecies;
  score: number;
  safety: SafetyLevel;
  waveEnergy: number;
  verdict: string;
  pros: string[];
  cons: string[];
}
