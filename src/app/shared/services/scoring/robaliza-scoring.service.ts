import { Injectable } from '@angular/core';
import { TargetSpecies } from '../../../core/models/enums/species.enum';
import { TidePhase } from '../../../core/models/enums/tide-phase.enum';
import { MarineConditions } from '../../../core/models/interfaces/marine-conditions.model';
import { SimpleScoreResult } from '../../../core/models/interfaces/spot-recommendation.model';
import { SpeciesScoringStrategy } from './species-scoring.interface';

@Injectable({ providedIn: 'root' })
export class RobalizaScoringService implements SpeciesScoringStrategy {
  readonly species = TargetSpecies.ROBALIZA;

  calculateScore(conditions: MarineConditions): SimpleScoreResult {
    const {
      waveHeight,
      windSpeed,
      tidePhase,
      isCrepuscular,
      isDaylight,
      waterTemperature,
    } = conditions;

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
    } else if (windSpeed > 20 && windSpeed <= 25) {
      windScore = 3;
    } else {
      windScore = 0;
    }

    let finalScore =
      waveScore + lightScore + tideScore + waterTempScore + windScore;
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
