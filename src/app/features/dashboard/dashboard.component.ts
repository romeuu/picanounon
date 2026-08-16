import { JsonPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { PortService } from '../../core/services/port.service';
import { PortSelectorComponent } from '../../shared/components/port-selector/port-selector.component';

@Component({
  selector: 'app-dashboard',
  imports: [PortSelectorComponent, JsonPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly _portService = inject(PortService);

  selectedPort = computed(() => this._portService.selectedPort());
}
