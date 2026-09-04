import { Injectable } from '@angular/core';
import { TargetSpecies } from '../../../core/models/enums/species.enum';
import { TidePhase } from '../../../core/models/enums/tide-phase.enum';
import { MarineConditions } from '../../../core/models/interfaces/marine-conditions.model';
import { SimpleScoreResult } from '../../../core/models/interfaces/spot-recommendation.model';
import { SpeciesScoringStrategy } from './species-scoring.interface';

@Injectable({ providedIn: 'root' })
export class XardaScoringService implements SpeciesScoringStrategy {
  readonly species = TargetSpecies.XARDA;

  calculateScore(conditions: MarineConditions): SimpleScoreResult {
    const {
      waveHeight,
      windSpeed,
      tidePhase,
      waterTemperature,
      isDaylight,
      isCrepuscular,
    } = conditions;

    if (!isDaylight) {
      return {
        score: 5,
        isSafe: true,
        verdict: 'Sen actividade nocturna para pesca a boia.',
      };
    }

    // 1. Estado do mar (35 pts) - Quere mar acougado nas rías
    let waveScore = 0;
    if (waveHeight <= 0.7) {
      waveScore = 35; // Óptimo para manter o cardume e macizar
    } else if (waveHeight <= 1.1) {
      waveScore = 22;
    } else if (waveHeight <= 1.5) {
      waveScore = 10;
    } else {
      waveScore = 0; // Mar batido: marcha cara a fóra
    }

    // 2. Luz (25 pts) - Caza visual en banco
    let lightScore = 0;
    if (isDaylight && !isCrepuscular) {
      lightScore = 25; // Sol pleno, visibilidade total do engado
    } else if (isCrepuscular) {
      lightScore = 15; // Amencer ou solpor
    }

    // 3. Temperatura da auga (20 pts) - Especie de augas mornas
    let waterTempScore = 0;
    if (waterTemperature !== undefined) {
      if (waterTemperature >= 16) {
        waterTempScore = 20; // Pico de tempada (agosto - outubro)
      } else if (waterTemperature >= 14) {
        waterTempScore = 12;
      } else {
        waterTempScore = 2; // Auga fría (< 14°C): apenas entran na ría
      }
    } else {
      waterTempScore = 14;
    }

    // 4. Vento (10 pts) - O vento molesta no lance e afunde a liña
    let windScore = 0;
    if (windSpeed <= 15) {
      windScore = 10;
    } else if (windSpeed <= 22) {
      windScore = 5;
    } else {
      windScore = 0;
    }

    // 5. Marea (10 pts) - Preferencia polas horas con calado no porto
    let tideScore = 0;
    if (tidePhase === TidePhase.PREAMAR || tidePhase === TidePhase.ENCHENTE) {
      tideScore = 10; // Calado suficiente nos espigóns
    } else {
      tideScore = 4;
    }

    let finalScore =
      waveScore + lightScore + waterTempScore + windScore + tideScore;
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
