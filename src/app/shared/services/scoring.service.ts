import { inject, Injectable } from '@angular/core';
import { SafetyLevel } from '../../core/models/enums/safety-level.enum';
import { TargetSpecies } from '../../core/models/enums/species.enum';
import { MarineConditions } from '../../core/models/interfaces/marine-conditions.model';
import { SimpleScoreResult } from '../../core/models/interfaces/spot-recommendation.model';
import { AgullaScoringService } from './scoring/agulla-scoring.service';
import { RobalizaScoringService } from './scoring/robaliza-scoring.service';
import { SargoScoringService } from './scoring/sargo-scoring.service';
import { SpeciesScoringStrategy } from './scoring/species-scoring.interface';

@Injectable({ providedIn: 'root' })
export class ScoringService {
  private readonly _sargoScoring = inject(SargoScoringService);
  private readonly _robalizaScoring = inject(RobalizaScoringService);
  private readonly _agullaScoring = inject(AgullaScoringService);

  private readonly _strategies: Record<TargetSpecies, SpeciesScoringStrategy> = {
    [TargetSpecies.SARGOS]: this._sargoScoring,
    [TargetSpecies.ROBALIZA]: this._robalizaScoring,
    [TargetSpecies.AGULLAS]: this._agullaScoring,
  };

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
    const { waveHeight, wavePeriod = 9 } = conditions;

    // 1. Corte estrito de seguridade combinando Altura (Hs) e Período (Tp)
    const safetyLevel = this.evaluateSafety(waveHeight, wavePeriod);
    if (safetyLevel === SafetyLevel.PERIGO_EXTREMO) {
      return {
        score: 10,
        isSafe: false,
        verdict: 'Mar perigoso. Risco alto de golpe de mar na pedra.',
      };
    }

    // 2. Delegar cálculo específico no servizo da especie
    const strategy = this._strategies[species] ?? this._sargoScoring;
    return strategy.calculateScore(conditions);
  }
}

