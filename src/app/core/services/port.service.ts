import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ApiResponse } from '../../shared/models/api-response.model';
import { normalizeText } from '../../shared/utils/text-utils';
import { Zone } from '../models/enums/zone.enum';
import { Port } from '../models/interfaces/port';

@Injectable({
  providedIn: 'root',
})
export class PortService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/ports';

  private readonly _ports = signal<Port[]>([]);
  readonly ports = this._ports.asReadonly();

  private readonly _selectedPort = signal<Port | null>(null);
  readonly selectedPort = this._selectedPort.asReadonly();

  private readonly _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  private readonly STORAGE_KEY = 'selected_port_id';

  constructor() {
    this.loadPorts();
  }

  loadPorts(): void {
    this._isLoading.set(true);
    this.http.get<ApiResponse<Port>>(this.API_URL).subscribe({
      next: (response) => {
        this._ports.set(response.data);
        this.initDefaultPort(response.data);
        this._isLoading.set(false);
      },
      error: (err) => {
        console.error(
          'Error al cargar la lista de puertos desde el backend:',
          err,
        );
        this._isLoading.set(false);
      },
    });
  }

  getPortById(id: number): Port | undefined {
    return this._ports().find((port) => port.id === id);
  }

  getPortByName(name: string): Port[] {
    const cleanSearch = normalizeText(name);

    return this._ports().filter((port) =>
      normalizeText(port.name).includes(cleanSearch),
    );
  }

  getAllPorts(): Port[] {
    return this._ports();
  }

  getPortsByZone(zone: Zone): Port[] {
    return this._ports().filter((port) => port.zone === zone);
  }

  getAvailableZones(): Zone[] {
    return Array.from(new Set(this._ports().map((p) => p.zone)));
  }

  selectPort(port: Port): void {
    this._selectedPort.set(port);
    this.savePortToStorage(port.id);
  }

  private initDefaultPort(portsList: Port[]): void {
    if (!portsList || portsList.length === 0) return;

    const savedId = localStorage.getItem(this.STORAGE_KEY);
    if (savedId) {
      const port = portsList.find((p) => p.id === Number(savedId));
      if (port) {
        this._selectedPort.set(port);
        return;
      }
    }
    // Si no hay ninguno guardado o no existe, puerto por defecto (el primero)
    this._selectedPort.set(portsList[0]);
  }

  private savePortToStorage(portId: number): void {
    localStorage.setItem(this.STORAGE_KEY, portId.toString());
  }
}
