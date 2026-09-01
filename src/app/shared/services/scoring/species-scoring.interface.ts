import { TargetSpecies } from '../../../core/models/enums/species.enum';
import { MarineConditions } from '../../../core/models/interfaces/marine-conditions.model';
import { SimpleScoreResult } from '../../../core/models/interfaces/spot-recommendation.model';

export interface SpeciesScoringStrategy {
  readonly species: TargetSpecies;
  calculateScore(conditions: MarineConditions): SimpleScoreResult;
}
