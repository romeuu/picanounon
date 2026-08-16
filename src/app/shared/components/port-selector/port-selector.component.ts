import { CommonModule } from '@angular/common';
import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Port } from '../../../core/models/port';
import { PortService } from '../../../core/services/port.service';

@Component({
  selector: 'app-port-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './port-selector.component.html',
})
export class PortSelectorComponent {
  private portService = inject(PortService);

  isOpen = signal<boolean>(false);
  searchQuery = signal<string>('');

  activePort = this.portService.selectedPort;

  portSelected = output<Port>();

  filteredPorts = computed(() => {
    return this.portService.getPortByName(this.searchQuery());
  });

  onSelect(port: Port): void {
    this.portService.selectPort(port);
    this.isOpen.set(false);
    this.portSelected.emit(port);
  }
}
