import { NgClass } from '@angular/common';
import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { PortService } from '../../core/services/port.service';
import { PortSelectorComponent } from '../../shared/components/port-selector/port-selector.component';
import { ForecastService } from '../../shared/services/forecast.service';

@Component({
  selector: 'app-dashboard',
  imports: [PortSelectorComponent, NgClass],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly _portService = inject(PortService);
  private readonly _forecastService = inject(ForecastService);

  selectedPort = computed(() => this._portService.selectedPort());
  hourlyForecast = computed(() => this._forecastService.hourlyForecast());
  isLoading = computed(() => this._forecastService.isLoading());
  currentTime = new Date();

  constructor() {
    effect(() => {
      const port = this.selectedPort();

      this._forecastService.loadForecastForPort(port);
    });
  }

  ngOnInit(): void {
    // Cargar el puerto seleccionado por defecto al iniciar la app
    const initialPort = this.selectedPort();
    if (initialPort) {
      this._forecastService.loadForecastForPort(initialPort);
    }
  }

  colorByScore(score: number): string {
    if (score < 65 && score >= 40) {
      return 'text-yellow-400';
    } else if (score < 40) {
      return 'text-red-400';
    }

    return 'text-emerald-400';
  }
}
