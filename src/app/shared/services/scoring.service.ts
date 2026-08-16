import { Service } from '@angular/core';
import { SafetyLevel } from '../../core/models/enums/safety-level.enum';

@Service()
export class ScoringService {
  /**
   * Densidade de fluxo de enerxía da onda: P ≈ 0.49 * Hs^2 * Tp (kW/m)
   */
  calculateWaveEnergy(hs: number, tp: number): number {
    const energy = 0.49 * Math.pow(hs, 2) * tp;
    return Math.round(energy * 10) / 10;
  }

  evaluateSafety(hs: number, tp: number): SafetyLevel {
    const energy = this.calculateWaveEnergy(hs, tp);
    // Vagas con período longo (>13s) aumentan exponencialmente o risco
    if (energy > 28 || hs >= 2.3 || (hs >= 1.5 && tp >= 14)) {
      return SafetyLevel.PERIGO_EXTREMO;
    }
    if (energy > 16 || hs >= 1.7 || (hs >= 1.2 && tp >= 12)) {
      return SafetyLevel.PRECAUCION;
    }
    return SafetyLevel.SEGURO;
  }

  /**
   * Factor de seguridade multiplicador (K_seguridade ∈ [0, 1])
   */
  private calculateSafetyMultiplier(energy: number): number {
    if (energy <= 16) return 1.0;
    if (energy >= 30) return 0.0;
    // Redución progresiva entre 16 e 30 kW/m
    return Math.max(0.1, 1.0 - (energy - 16) / 14);
  }
}
