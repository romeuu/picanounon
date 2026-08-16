import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PortSelectorComponent } from './shared/components/port-selector/port-selector.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PortSelectorComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'picanounon';
}
