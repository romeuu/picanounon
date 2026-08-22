import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TargetSpecies } from '../../../../core/models/enums/species.enum';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';

@Component({
  selector: 'app-card-score',
  standalone: true,
  imports: [UiCardComponent, NgClass],
  host: {
    class: 'block h-full min-w-0',
  },
  templateUrl: './card-score.component.html',
  styleUrl: './card-score.component.css',
})
export class CardScoreComponent {
  @Input() selectedSpecies: TargetSpecies | string = TargetSpecies.SARGOS;
  @Input() score = 0;

  get fishIcon(): string {
    const sp = (this.selectedSpecies || '').toUpperCase();
    if (sp.includes('ROBALIZA')) return 'assets/robalizas.svg';
    if (sp.includes('AGULLA')) return 'assets/agullas.svg';
    return 'assets/sargos.svg';
  }

  get scoreColorClass(): string {
    if (this.score >= 65) return 'text-[#2dd4bf]';
    if (this.score >= 40) return 'text-[#facc15]';
    return 'text-[#f87171]';
  }
}
