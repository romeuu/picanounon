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

    // 1. Corte estrito de seguridade na pedra / mar excesivo
    if (waveHeight >= 2.2) {
      return {
        score: 10,
        isSafe: false,
        verdict: 'Mar perigoso. Risco alto na pedra.',
      };
    }

    let finalScore = 0;

    switch (species) {
      case TargetSpecies.ROBALIZA: {
        // Total: 100 pts (Mar: 40, Luz: 25, Marea: 20, Vento: 15)
        let waveScore = 0;
        if (waveHeight >= 1.2 && waveHeight <= 1.6) {
          waveScore = 40; // Rango óptimo (auga osixenada e escuma perfecta)
        } else if (waveHeight >= 0.9 && waveHeight < 1.2) {
          waveScore = 28; // Bo
        } else if (waveHeight > 1.6 && waveHeight <= 2.0) {
          waveScore = 20; // Mar forte pero pescable
        } else if (waveHeight >= 0.6 && waveHeight < 0.9) {
          waveScore = 12; // Mar algo escaso
        } else {
          waveScore = 5; // < 0.6m auga prato, desconfianza total
        }

        let lightScore = 0;
        if (isCrepuscular) {
          lightScore = 25; // Pico de caza ao amencer/serán
        } else if (!isDaylight) {
          lightScore = 15; // Caza nocturna activa
        } else {
          lightScore = 5; // Día pleno, menor actividade preto da beira
        }

        let tideScore = 0;
        if (
          tidePhase === TidePhase.ENCHENTE ||
          tidePhase === TidePhase.MINGUANTE
        ) {
          tideScore = 20; // Auga en movemento, arrastre de alimento
        } else if (tidePhase === TidePhase.PREAMAR) {
          tideScore = 10; // Presas na beira pero menor corrente
        } else {
          tideScore = 0; // Baixamar parada
        }

        let windScore = 0;
        if (windSpeed >= 8 && windSpeed <= 20) {
          windScore = 15; // Brisa que encrespa a superficie
        } else if (windSpeed < 8) {
          windScore = 10; // Calma
        } else if (windSpeed <= 25) {
          windScore = 5;
        } else {
          windScore = 0; // Vento moi molesto (> 25 km/h)
        }

        finalScore = waveScore + lightScore + tideScore + windScore;
        break;
      }

      case TargetSpecies.SARGOS: {
        // Total: 100 pts (Mar: 50, Marea: 30, Vento: 20)
        let waveScore = 0;
        if (waveHeight >= 1.3 && waveHeight <= 1.8) {
          waveScore = 50; // O mar batido ideal con escumeiro abundante
        } else if (waveHeight >= 1.0 && waveHeight < 1.3) {
          waveScore = 35; // Aceptable
        } else if (waveHeight > 1.8 && waveHeight <= 2.1) {
          waveScore = 30; // Moito mar, técnico
        } else if (waveHeight >= 0.7 && waveHeight < 1.0) {
          waveScore = 15;
        } else {
          waveScore = 0; // < 0.7m auga excesivamente parada nas pedras
        }

        let tideScore = 0;
        if (tidePhase === TidePhase.ENCHENTE) {
          tideScore = 30; // O momento clave cando enchen as pedras
        } else if (tidePhase === TidePhase.PREAMAR) {
          tideScore = 25; // Auga alta, mariscando
        } else if (tidePhase === TidePhase.MINGUANTE) {
          tideScore = 10; // Comezan a retirarse
        } else {
          tideScore = 0; // Baixamar: pedras ao descuberto
        }

        let windScore = 0;
        if (windSpeed >= 10 && windSpeed <= 22) {
          windScore = 20; // Vento axeitado
        } else if (windSpeed < 10) {
          windScore = 12;
        } else if (windSpeed <= 28) {
          windScore = 5;
        } else {
          windScore = 0; // Vento duro
        }

        finalScore = waveScore + tideScore + windScore;
        break;
      }

      case TargetSpecies.AGULLAS: {
        // A agulla precisa luz solar directa en superficie; sen luz de día a pesca é inviable
        if (!isDaylight) {
          return {
            score: 5,
            isSafe: true,
            verdict: 'Sen actividade nocturna (Especie estritamente diúrna).',
          };
        }

        // Se é crepúsculo (pouca luz solar), a actividade cae drasticamente
        if (isCrepuscular) {
          return {
            score: 20,
            isSafe: true,
            verdict: 'Actividade moi baixa polo solpor/falta de sol.',
          };
        }

        // Total con sol pleno: 100 pts (Mar: 45, Luz: 25, Vento: 15, Marea: 15)
        let waveScore = 0;
        if (waveHeight <= 0.6) {
          waveScore = 45; // Mar prato
        } else if (waveHeight <= 0.9) {
          waveScore = 30;
        } else if (waveHeight <= 1.2) {
          waveScore = 15;
        } else {
          waveScore = 0; // Superficie demasiado rota
        }

        const lightScore = 25; // Pleno sol con isDaylight activo

        let windScore = 0;
        if (windSpeed < 10) {
          windScore = 15; // Superficie de espello
        } else if (windSpeed <= 18) {
          windScore = 8;
        } else {
          windScore = 0;
        }

        let tideScore = 0;
        if (
          tidePhase === TidePhase.ENCHENTE ||
          tidePhase === TidePhase.PREAMAR
        ) {
          tideScore = 15;
        } else {
          tideScore = 5;
        }

        finalScore = waveScore + lightScore + windScore + tideScore;
        break;
      }
    }

    finalScore = Math.max(0, Math.min(100, finalScore));

    let verdict = 'Condicións desfavorables';
    if (finalScore >= 80) {
      verdict = 'Condicións óptimas (Moi bo momento)';
    } else if (finalScore >= 60) {
      verdict = 'Condicións favorables (Actividade boa)';
    } else if (finalScore >= 40) {
      verdict = 'Condicións regulares (Actividade moderada)';
    }

    return {
      score: finalScore,
      isSafe: true,
      verdict,
    };
  }
}
