import { NgClass } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { HourlyForecast } from '../../../../core/models/interfaces/hourly-forecast.model';
import {
  CurrentTideStatus,
  TideResponse,
} from '../../../../core/models/interfaces/meteo-galicia.model';
import { Port } from '../../../../core/models/interfaces/port';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { TideService } from '../../../../shared/services/tide.service';

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [UiCardComponent, NgClass],
  host: {
    class: 'block h-full min-w-0',
  },
  templateUrl: './info-card.component.html',
  styleUrl: './info-card.component.css',
})
export class InfoCardComponent {
  forecast = input.required<HourlyForecast | null>();
  port = input.required<Port | null>();

  private readonly _tideService = inject(TideService);
  readonly tideStatus = this._tideService.currentTideStatus;
}
