import { Injectable } from '@angular/core';
import { TargetSpecies } from '../../../core/models/enums/species.enum';
import { TidePhase } from '../../../core/models/enums/tide-phase.enum';
import { MarineConditions } from '../../../core/models/interfaces/marine-conditions.model';
import { SimpleScoreResult } from '../../../core/models/interfaces/spot-recommendation.model';
import { SpeciesScoringStrategy } from './species-scoring.interface';

@Injectable({ providedIn: 'root' })
export class AgullaScoringService implements SpeciesScoringStrategy {
  readonly species = TargetSpecies.AGULLAS;

  calculateScore(conditions: MarineConditions): SimpleScoreResult {
    const {
      waveHeight,
      windSpeed,
      tidePhase,
      isCrepuscular,
      isDaylight,
      waterTemperature,
      temperature,
    } = conditions;

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

    let finalScore =
      waveScore + lightScore + tempScore + windScore + tideScore;
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
