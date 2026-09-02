import { NgClass } from '@angular/common';
import { Component, effect, input, signal } from '@angular/core';
import { TargetSpecies } from '../../../../core/models/enums/species.enum';
import { HourlyForecast } from '../../../../core/models/interfaces/hourly-forecast.model';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { UiModalComponent } from '../../../../shared/components/ui-modal/ui-modal.component';

@Component({
  selector: 'app-card-score',
  standalone: true,
  imports: [UiCardComponent, UiModalComponent, NgClass],
  host: {
    class: 'block h-full min-w-0',
  },
  templateUrl: './card-score.component.html',
  styleUrl: './card-score.component.css',
})
export class CardScoreComponent {
  selectedSpecies = input<TargetSpecies | string>(TargetSpecies.SARGOS);
  forecast = input.required<HourlyForecast | null>();
  score = signal<number>(0);
  isModalOpen = signal<boolean>(false);

  constructor() {
    effect(() => {
      const forecast = this.forecast();
      if (!forecast) {
        this.score.set(0);
        return;
      }
      this.score.set(this.getScore());
    });
  }

  get fishIcon(): string {
    const sp = (this.selectedSpecies() || '').toUpperCase();
    if (sp.includes('ROBALIZA')) return 'assets/robalizas.svg';
    if (sp.includes('AGULLA')) return 'assets/agullas.svg';
    if (sp.includes('XARDA')) return 'assets/xarda.svg';
    return 'assets/sargos.svg';
  }

  getScore(): number {
    if (!this.forecast()) return 0;
    const sp = (this.selectedSpecies() || '').toUpperCase();
    if (sp.includes('ROBALIZA')) return this.forecast()?.scoreRobaliza || 0;
    if (sp.includes('AGULLA')) return this.forecast()?.scoreAgullas || 0;
    if (sp.includes('XARDA')) return this.forecast()?.scoreXardas || 0;
    return this.forecast()?.scoreSargos || 0;
  }

  get scoreColorClass(): string {
    if (this.score() >= 65) return 'text-green';
    if (this.score() >= 40) return 'text-yellow';
    return 'text-red';
  }
}
