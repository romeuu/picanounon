import { Component, input } from '@angular/core';
import { HourlyForecast } from '../../../../core/models/interfaces/hourly-forecast.model';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';

@Component({
  selector: 'app-temperature-card',
  standalone: true,
  imports: [UiCardComponent],
  host: {
    class: 'block h-full min-w-0',
  },
  templateUrl: './temperature-card.component.html',
  styleUrl: './temperature-card.component.css',
})
export class TemperatureCardComponent {
  forecast = input<HourlyForecast | null>(null);
}

