import { CommonModule } from '@angular/common';
import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Port } from '../../../core/models/interfaces/port';
import { PortService } from '../../../core/services/port.service';
import { ForecastService } from '../../services/forecast.service';

@Component({
  selector: 'app-port-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './port-selector.component.html',
})
export class PortSelectorComponent {
  private readonly _portService = inject(PortService);
  private readonly _forecastService = inject(ForecastService);

  isOpen = signal<boolean>(false);
  searchQuery = signal<string>('');

  activePort = this._portService.selectedPort;

  portSelected = output<Port>();

  filteredPorts = computed(() => {
    return this._portService.getPortByName(this.searchQuery());
  });

  onSelect(port: Port): void {
    this._portService.selectPort(port);
    this.isOpen.set(false);
    this.portSelected.emit(port);
  }
}
