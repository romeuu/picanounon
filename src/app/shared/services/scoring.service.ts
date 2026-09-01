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

  evaluateSafety(hs: number, tp: number = 9): SafetyLevel {
    const energy = this.calculateWaveEnergy(hs, tp);
    // Vagas con período longo (>13s) aumentan exponencialmente o risco na costa
    if (energy > 28 || hs >= 2.2 || (hs >= 1.5 && tp >= 14)) {
      return SafetyLevel.PERIGO_EXTREMO;
    }
    if (energy > 16 || hs >= 1.7 || (hs >= 1.2 && tp >= 12)) {
      return SafetyLevel.PRECAUCION;
    }
    return SafetyLevel.SEGURO;
  }

  calculateScore(
    conditions: MarineConditions,
    species: TargetSpecies,
  ): SimpleScoreResult {
    const {
      waveHeight,
      wavePeriod = 9,
      windSpeed,
      tidePhase,
      isCrepuscular,
      isDaylight,
      waterTemperature,
      temperature,
    } = conditions;

    // 1. Corte estrito de seguridade combinando Altura (Hs) e Período (Tp)
    const safetyLevel = this.evaluateSafety(waveHeight, wavePeriod);
    if (safetyLevel === SafetyLevel.PERIGO_EXTREMO) {
      return {
        score: 10,
        isSafe: false,
        verdict: 'Mar perigoso. Risco alto de golpe de mar na pedra.',
      };
    }

    let finalScore = 0;

    switch (species) {
      case TargetSpecies.ROBALIZA: {
        // Total: 100 pts (Mar: 35, Luz: 20, Marea: 20, Temp. Auga: 15, Vento: 10)
        let waveScore = 0;
        if (waveHeight >= 1.2 && waveHeight <= 1.6) {
          waveScore = 35;
        } else if (waveHeight >= 0.9 && waveHeight < 1.2) {
          waveScore = 25;
        } else if (waveHeight > 1.6 && waveHeight <= 2.0) {
          waveScore = 18;
        } else if (waveHeight >= 0.6 && waveHeight < 0.9) {
          waveScore = 10;
        } else {
          waveScore = 4;
        }

        let lightScore = 0;
        if (isCrepuscular) {
          lightScore = 20;
        } else if (!isDaylight) {
          lightScore = 12;
        } else {
          lightScore = 4;
        }

        let tideScore = 0;
        if (
          tidePhase === TidePhase.ENCHENTE ||
          tidePhase === TidePhase.MINGUANTE
        ) {
          tideScore = 20;
        } else if (tidePhase === TidePhase.PREAMAR) {
          tideScore = 10;
        } else {
          tideScore = 0;
        }

        let waterTempScore = 0;
        if (waterTemperature !== undefined) {
          if (waterTemperature >= 13 && waterTemperature <= 18) {
            waterTempScore = 15;
          } else if (waterTemperature >= 11 && waterTemperature < 13) {
            waterTempScore = 8;
          } else if (waterTemperature > 18 && waterTemperature <= 20) {
            waterTempScore = 10;
          } else {
            waterTempScore = 2;
          }
        } else {
          waterTempScore = 10;
        }

        let windScore = 0;
        if (windSpeed >= 8 && windSpeed <= 20) {
          windScore = 10;
        } else if (windSpeed < 8) {
          windScore = 7;
        } else if (windSpeed <= 25) {
          windScore = 3;
        } else {
          windScore = 0;
        }

        finalScore =
          waveScore + lightScore + tideScore + waterTempScore + windScore;
        break;
      }

      case TargetSpecies.SARGOS: {
        // Total: 100 pts (Mar: 45, Marea: 25, Vento: 15, Temp. Auga: 15)
        let waveScore = 0;
        if (waveHeight >= 1.3 && waveHeight <= 1.8) {
          waveScore = 45;
        } else if (waveHeight >= 1.0 && waveHeight < 1.3) {
          waveScore = 32;
        } else if (waveHeight > 1.8 && waveHeight <= 2.1) {
          waveScore = 25; // Moito mar, técnico
        } else if (waveHeight >= 0.7 && waveHeight < 1.0) {
          waveScore = 12;
        } else {
          waveScore = 0;
        }

        let tideScore = 0;
        if (tidePhase === TidePhase.ENCHENTE) {
          tideScore = 25;
        } else if (tidePhase === TidePhase.PREAMAR) {
          tideScore = 20;
        } else if (tidePhase === TidePhase.MINGUANTE) {
          tideScore = 8;
        } else {
          tideScore = 0;
        }

        let waterTempScore = 0;
        if (waterTemperature !== undefined) {
          if (waterTemperature >= 13 && waterTemperature <= 17) {
            waterTempScore = 15;
          } else if (waterTemperature >= 11 && waterTemperature < 13) {
            waterTempScore = 7;
          } else {
            waterTempScore = 0;
          }
        } else {
          waterTempScore = 10;
        }

        let windScore = 0;
        if (windSpeed >= 10 && windSpeed <= 22) {
          windScore = 15;
        } else if (windSpeed < 10) {
          windScore = 9;
        } else if (windSpeed <= 28) {
          windScore = 4;
        } else {
          windScore = 0;
        }

        finalScore = waveScore + tideScore + waterTempScore + windScore;
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

        // Total con sol pleno: 100 pts (Mar: 30, Luz: 25, Temp. Auga/Aire: 20, Vento: 15, Marea: 10)
        let waveScore = 0;
        if (waveHeight <= 0.6) {
          waveScore = 30; // Mar prato
        } else if (waveHeight <= 0.9) {
          waveScore = 20;
        } else if (waveHeight <= 1.2) {
          waveScore = 10;
        } else {
          waveScore = 0;
        }

        const lightScore = 25;

        let tempScore = 0;
        if (waterTemperature !== undefined) {
          if (waterTemperature >= 16) {
            tempScore += 15;
          } else if (waterTemperature >= 14) {
            tempScore += 8;
          } else {
            tempScore += 0;
          }
        } else {
          tempScore += 10;
        }

        if (temperature !== undefined && temperature >= 18) {
          tempScore += 5;
        } else if (temperature === undefined) {
          tempScore += 3;
        }

        let windScore = 0;
        if (windSpeed < 10) {
          windScore = 15;
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
          tideScore = 10;
        } else {
          tideScore = 4;
        }

        finalScore = waveScore + lightScore + tempScore + windScore + tideScore;
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
