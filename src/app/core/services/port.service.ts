import { Injectable, signal } from '@angular/core';
import { normalizeText } from '../../shared/utils/text-utils';
import { PORTS_DATA } from '../data/ports.data';
import { Zone } from '../models/enums/zone.enum';
import { Port } from '../models/interfaces/port';

@Injectable({
  providedIn: 'root',
})
export class PortService {
  ports: Port[] = PORTS_DATA;

  private readonly _selectedPort = signal<Port>(this.ports[0]);
  readonly selectedPort = this._selectedPort.asReadonly();

  private readonly STORAGE_KEY = 'selected_port_id';

  constructor() {}

  getPortById(id: number) {
    return this.ports.find((port) => port.id === id);
  }

  getPortByName(name: string) {
    const cleanSearch = normalizeText(name);

    return this.ports.filter((port) =>
      normalizeText(port.name).includes(cleanSearch),
    );
  }

  getAllPorts() {
    return this.ports;
  }

  getPortsByZone(zone: Zone): Port[] {
    return this.ports.filter((port) => port.zone === zone);
  }

  getAvailableZones(): Zone[] {
    return Array.from(new Set(this.ports.map((p) => p.zone)));
  }

  selectPort(port: Port): void {
    this._selectedPort.set(port);
    this.savePortToStorage(port.id);
  }

  initDefaultPort(): void {
    const savedId = localStorage.getItem(this.STORAGE_KEY);
    if (savedId) {
      const port = this.getPortById(Number(savedId));
      if (port) {
        this._selectedPort.set(port);
        return;
      }
    }
    // Se non hai nada gardado, porto por defecto
    this._selectedPort.set(this.ports[0]);
  }

  private savePortToStorage(portId: number): void {
    localStorage.setItem(this.STORAGE_KEY, portId.toString());
  }
}
