import { Injectable } from '@angular/core';
import { SafetyLevel } from '../../core/models/enums/safety-level.enum';
import { TargetSpecies } from '../../core/models/enums/species.enum';
import { TidePhase } from '../../core/models/enums/tide-phase.enum';
import { MarineConditions } from '../../core/models/interfaces/marine-conditions.model';
import { SimpleScoreResult } from '../../core/models/interfaces/spot-recommendation.model';

@Injectable({ providedIn: 'root' })
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
    const { waveHeight, windSpeed, tidePhase, isCrepuscular, isDaylight } =
      conditions;

    // 1. Corte estrito de seguridade na pedra
    if (waveHeight >= 2.2) {
      return {
        score: 10,
        isSafe: false,
        verdict: 'Mar perigoso. Risco alto na pedra.',
      };
    }

    let score = 50;

    switch (species) {
      case TargetSpecies.SARGOS:
        // Puntuación graduada de mar batido / escuma
        if (waveHeight >= 1.2 && waveHeight <= 1.9) {
          score += 35;
        } else if (waveHeight >= 0.9 && waveHeight < 1.2) {
          score += 15; // Mar aceptable
        } else if (waveHeight > 1.9 && waveHeight < 2.2) {
          score += 10; // Moito mar, pesca técnica
        } else {
          score -= 30; // Menos de 0.9m: auga excesivamente parada
        }

        // Factor Marea
        if (
          tidePhase === TidePhase.ENCHENTE ||
          tidePhase === TidePhase.PREAMAR
        ) {
          score += 20;
        } else if (tidePhase === TidePhase.MINGUANTE) {
          score -= 5;
        } else if (tidePhase === TidePhase.BAIXAMAR) {
          score -= 20;
        }

        // Vento para o sargo
        if (windSpeed > 30) score -= 20;
        else if (windSpeed >= 10 && windSpeed <= 22) score += 10;
        break;

      case TargetSpecies.ROBALIZA:
        // Mar favorable para spinning/costa
        if (waveHeight >= 1.0 && waveHeight <= 1.7) {
          score += 30;
        } else if (waveHeight >= 0.7 && waveHeight < 1.0) {
          score += 15;
        } else if (waveHeight > 1.7) {
          score += 5;
        } else {
          score -= 20; // < 0.7m auga moi clara
        }

        // Factor Luz (clave nos lances)
        if (isCrepuscular) {
          score += 25;
        } else if (!isDaylight) {
          score += 10; // A robaliza mantén actividade nocturna
        }

        // Factor Marea
        if (
          tidePhase === TidePhase.ENCHENTE ||
          tidePhase === TidePhase.MINGUANTE
        ) {
          score += 20;
        } else if (tidePhase === TidePhase.PREAMAR) {
          score += 5; // Achegamento de presas á costa
        } else if (tidePhase === TidePhase.BAIXAMAR) {
          score -= 15;
        }

        if (windSpeed > 25) score -= 15;
        break;

      case TargetSpecies.AGULLAS:
        // Precisa mar calmo
        if (waveHeight <= 0.7) {
          score += 35;
        } else if (waveHeight <= 1.1) {
          score += 10;
        } else {
          score -= 35; // > 1.1m a superficie está rota
        }

        // Luz estrita (caza en superficie 100% visual)
        if (!isDaylight) {
          score -= 60;
        } else if (isCrepuscular) {
          score += 5;
        } else {
          score += 20; // Pleno sol
        }

        // Factor Marea
        if (
          tidePhase === TidePhase.ENCHENTE ||
          tidePhase === TidePhase.PREAMAR
        ) {
          score += 15;
        }

        // Vento (o vento riza a superficie e impide ver o engado)
        if (windSpeed > 18) score -= 25;
        else if (windSpeed < 10) score += 15;
        break;
    }

    const finalScore = Math.max(0, Math.min(100, score));

    let verdict = 'Condicións desfavorables';
    if (finalScore >= 75) {
      verdict = 'Condicións moi favorables (Bo momento)';
    } else if (finalScore >= 50) {
      verdict = 'Condicións regulares (Actividade media)';
    }

    return {
      score: finalScore,
      isSafe: true,
      verdict,
    };
  }
}
