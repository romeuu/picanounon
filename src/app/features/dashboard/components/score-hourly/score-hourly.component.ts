import { CommonModule, NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { TargetSpecies } from '../../../../core/models/enums/species.enum';
import { HourlyForecast } from '../../../../core/models/interfaces/hourly-forecast.model';

@Component({
  selector: 'app-score-hourly',
  standalone: true,
  imports: [CommonModule, NgClass],
  host: {
    class: 'block w-full min-w-0',
  },
  templateUrl: './score-hourly.component.html',
  styleUrl: './score-hourly.component.css',
})
export class ScoreHourlyComponent {
  forecasts = input<HourlyForecast[]>([]);
  selectedSpecies = input<TargetSpecies | string>(TargetSpecies.SARGOS);

  getScore(item: HourlyForecast): number {
    const sp = (this.selectedSpecies() || '').toUpperCase();
    if (sp.includes('ROBALIZA')) return item.scoreRobaliza;
    if (sp.includes('AGULLA')) return item.scoreAgullas;
    return item.scoreSargos;
  }

  getScoreColorClass(score: number): string {
    if (score >= 65) return 'text-green';
    if (score >= 40) return 'text-yellow';
    return 'text-red';
  }
}


