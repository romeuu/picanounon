import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  model,
  signal,
} from '@angular/core';
import { TargetSpecies } from '../../core/models/enums/species.enum';
import { HourlyForecast } from '../../core/models/interfaces/hourly-forecast.model';
import { PortService } from '../../core/services/port.service';
import { DaySelectorComponent } from '../../shared/components/day-selector/day-selector.component';
import { FishSelectorComponent } from '../../shared/components/fish-selector/fish-selector.component';
import { PortSelectorComponent } from '../../shared/components/port-selector/port-selector.component';
import { ForecastService } from '../../shared/services/forecast.service';
import { CardScoreComponent } from './components/card-score/card-score.component';
import { InfoCardComponent } from './components/info-card/info-card.component';
import { ScoreHourlyComponent } from './components/score-hourly/score-hourly.component';
import { TemperatureCardComponent } from './components/temperature-card/temperature-card.component';

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
    TemperatureCardComponent,
    ScoreHourlyComponent,
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

  selectedDate = signal<Date>(new Date());
  selectedSpecies = model<TargetSpecies>(TargetSpecies.SARGOS);
  selectedPort = computed(() => this._portService.selectedPort());
  hourlyForecast = computed(() => this._forecastService.hourlyForecast());
  isLoading = computed(() => this._forecastService.isLoading());

  isToday = computed<boolean>(() => {
    const selected = this.selectedDate();
    const now = new Date();
    return (
      selected.getFullYear() === now.getFullYear() &&
      selected.getMonth() === now.getMonth() &&
      selected.getDate() === now.getDate()
    );
  });

  currentForecast = computed<HourlyForecast | null>(() => {
    const list = this.hourlyForecast();
    if (!list || list.length === 0) return null;

    const currentHourStr = String(new Date().getHours()).padStart(2, '0');
    if (this.isToday()) {
      return (
        list.find((item) => item.time.startsWith(currentHourStr)) || list[0]
      );
    } else {
      return (
        list.find((item) => item.time.startsWith(currentHourStr)) ||
        list[12] ||
        list[0]
      );
    }
  });

  upcomingForecast = computed<HourlyForecast[]>(() => {
    const list = this.hourlyForecast();
    if (!list || list.length === 0) return [];

    if (this.isToday()) {
      const currentHourNum = new Date().getHours();
      return list.filter((item) => {
        const hour = parseInt(item.time.split(':')[0], 10);
        return hour >= currentHourNum;
      });
    } else {
      // Para un día futuro, amosamos todas as previsións horarias (00:00 - 23:00)
      return list;
    }
  });

  constructor() {
    effect(() => {
      const port = this.selectedPort();
      const date = this.selectedDate();
      if (port) {
        this._forecastService.loadForecastForPort(port, date);
      }
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
      return 'text-green';
    } else if (score >= 40) {
      return 'text-yellow';
    } else {
      return 'text-red';
    }
  }

  badgeClassByScore(score: number): string {
    if (score >= 65) {
      return 'bg-green/10 text-green border-green/30';
    } else if (score >= 40) {
      return 'bg-yellow/10 text-yellow border-yellow/30';
    } else {
      return 'bg-red/10 text-red border-red/30';
    }
  }

  onDaySelected(date: Date) {
    this.selectedDate.set(date);
  }
}
