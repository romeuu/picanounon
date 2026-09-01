import { Injectable } from '@angular/core';
import { TargetSpecies } from '../../../core/models/enums/species.enum';
import { TidePhase } from '../../../core/models/enums/tide-phase.enum';
import { MarineConditions } from '../../../core/models/interfaces/marine-conditions.model';
import { SimpleScoreResult } from '../../../core/models/interfaces/spot-recommendation.model';
import { SpeciesScoringStrategy } from './species-scoring.interface';

@Injectable({ providedIn: 'root' })
export class SargoScoringService implements SpeciesScoringStrategy {
  readonly species = TargetSpecies.SARGOS;

  calculateScore(conditions: MarineConditions): SimpleScoreResult {
    const { waveHeight, windSpeed, tidePhase, waterTemperature } = conditions;

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
      } else if (waterTemperature > 17 && waterTemperature <= 20) {
        waterTempScore = 4;
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

    let finalScore = waveScore + tideScore + waterTempScore + windScore;
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
