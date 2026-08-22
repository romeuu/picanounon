import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HourlyForecast } from '../../../../core/models/interfaces/hourly-forecast.model';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';

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
  @Input() forecast: HourlyForecast | null = null;
}
