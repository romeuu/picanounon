import { Service } from '@angular/core';
import { SafetyLevel } from '../../core/models/enums/safety-level.enum';
import { TargetSpecies } from '../../core/models/enums/species.enum';
import { MarineConditions } from '../../core/models/interfaces/marine-conditions.model';
import { SimpleScoreResult } from '../../core/models/interfaces/spot-recommendation.model';

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

  calculateScore(
    conditions: MarineConditions,
    species: TargetSpecies,
  ): SimpleScoreResult {
    const { waveHeight, windSpeed } = conditions;
    const isSafe = waveHeight < 2.2;

    if (!isSafe) {
      return {
        score: 15,
        isSafe: false,
        verdict: 'Mar excesivo. Risco na pedra.',
      };
    }

    let score = 50;

    switch (species) {
      case TargetSpecies.SARGOS:
        // Quere mar batido (1.2m a 1.9m)
        if (waveHeight >= 1.2 && waveHeight <= 1.9) score += 35;
        else if (waveHeight < 0.8) score -= 25;
        break;

      case TargetSpecies.ROBALIZA:
        if (waveHeight >= 1.0 && waveHeight <= 1.7) {
          score += 30;
        } else if (waveHeight < 0.7) {
          score -= 15; // Penalización moderada, non destrutiva
        }

        // Factor luz crítico para a robaliza
        if (conditions.isCrepuscular) {
          score += 20; // Picos de amencer (07:00-08:00) e serán (21:00-22:00)
        }
        break;

      case TargetSpecies.AGULLAS:
        if (waveHeight <= 0.8) score += 30;
        else if (waveHeight > 1.2) score -= 30;

        // 2. Penalización nocturna estrita (caza visual)
        if (!conditions.isDaylight) {
          score -= 40; // De noite a agulla non ten actividade
        } else if (!conditions.isCrepuscular) {
          score += 15; // Pleno sol é o seu pico
        }
        break;
    }

    // Penalización por vento forte
    if (windSpeed > 25) {
      score -= 20;
    } else if (windSpeed < 15) {
      score += 15;
    }

    const finalScore = Math.max(0, Math.min(100, score));

    return {
      score: finalScore,
      isSafe: true,
      verdict:
        finalScore >= 75 ? 'Condicións favorables' : 'Condicións regulares',
    };
  }
}
