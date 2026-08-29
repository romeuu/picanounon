import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, model } from '@angular/core';
import { TargetSpecies } from '../../core/models/enums/species.enum';
import { HourlyForecast } from '../../core/models/interfaces/hourly-forecast.model';
import { PortService } from '../../core/services/port.service';
import { DaySelectorComponent } from '../../shared/components/day-selector/day-selector.component';
import { FishSelectorComponent } from '../../shared/components/fish-selector/fish-selector.component';
import { PortSelectorComponent } from '../../shared/components/port-selector/port-selector.component';
import { ForecastService } from '../../shared/services/forecast.service';
import { CardScoreComponent } from './components/card-score/card-score.component';
import { InfoCardComponent } from './components/info-card/info-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    PortSelectorComponent,
    CommonModule,
    DaySelectorComponent,
    FishSelectorComponent,
    CardScoreComponent,
    InfoCardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly _portService = inject(PortService);
  private readonly _forecastService = inject(ForecastService);

  readonly TargetSpecies = TargetSpecies;
  readonly speciesOptions = [
    { key: TargetSpecies.SARGOS, label: 'Sargos' },
    { key: TargetSpecies.ROBALIZA, label: 'Robaliza' },
    { key: TargetSpecies.AGULLAS, label: 'Agullas' },
  ];

  selectedSpecies = model<TargetSpecies>(TargetSpecies.SARGOS);
  selectedPort = computed(() => this._portService.selectedPort());
  hourlyForecast = computed(() => this._forecastService.hourlyForecast());
  isLoading = computed(() => this._forecastService.isLoading());

  currentForecast = computed<HourlyForecast | null>(() => {
    const list = this.hourlyForecast();
    if (!list || list.length === 0) return null;
    const currentHourStr = String(new Date().getHours()).padStart(2, '0');
    return list.find((item) => item.time.startsWith(currentHourStr)) || list[0];
  });

  upcomingForecast = computed<HourlyForecast[]>(() => {
    const list = this.hourlyForecast();
    if (!list || list.length === 0) return [];
    const currentHourNum = new Date().getHours();
    return list.filter((item) => {
      const hour = parseInt(item.time.split(':')[0], 10);
      return hour >= currentHourNum;
    });
  });

  constructor() {
    effect(() => {
      const port = this.selectedPort();
      if (port) {
        this._forecastService.loadForecastForPort(port);
      }
    });

    effect(() => {
      const selectedSpecie = this.selectedSpecies();
    });
  }

  getScoreForSpecies(
    forecast: HourlyForecast | null,
    species: TargetSpecies,
  ): number {
    if (!forecast) return 0;
    switch (species) {
      case TargetSpecies.SARGOS:
        return forecast.scoreSargos;
      case TargetSpecies.ROBALIZA:
        return forecast.scoreRobaliza;
      case TargetSpecies.AGULLAS:
        return forecast.scoreAgullas;
    }
  }

  colorByScore(score: number): string {
    if (score >= 65) {
      return 'text-emerald-400';
    } else if (score >= 40) {
      return 'text-yellow-400';
    } else {
      return 'text-red-400';
    }
  }

  badgeClassByScore(score: number): string {
    if (score >= 65) {
      return 'bg-emerald-950 text-emerald-400 border-emerald-800';
    } else if (score >= 40) {
      return 'bg-amber-950 text-amber-400 border-amber-800';
    } else {
      return 'bg-rose-950 text-rose-400 border-rose-800';
    }
  }
}
