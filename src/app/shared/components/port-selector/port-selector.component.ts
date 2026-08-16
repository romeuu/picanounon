import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Port } from '../../../core/models/port';
import { PortService } from '../../../core/services/port.service';

@Component({
  selector: 'app-port-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Botón disparador (Caixa estilo consola) -->
    <div
      (click)="isOpen.set(true)"
      class="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-600 p-3 flex justify-between items-center cursor-pointer transition-colors"
    >
      <div>
        <div class="text-[10px] text-neutral-500 uppercase tracking-widest">
          [PORTO SELECCIONADO]
        </div>
        <div class="text-sm font-bold text-neutral-100 mt-0.5">
          {{ activePort()?.name ?? 'SELECCIONAR PORTO' }}
        </div>
      </div>
      <div
        class="text-xs text-neutral-400 border border-neutral-700 px-2 py-1 hover:bg-neutral-800"
      >
        CAMBIAR ↵
      </div>
    </div>

    <!-- Modal / Overlay Monocromo -->
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div
          class="w-full max-w-lg bg-neutral-950 border border-neutral-800 shadow-2xl flex flex-col max-h-[85vh]"
        >
          <!-- Cabeceira do Modal -->
          <div
            class="p-4 border-b border-neutral-800 flex justify-between items-center"
          >
            <span class="text-xs uppercase tracking-widest text-neutral-400"
              >// CATÁLOGO DE MAREÓGRAFOS</span
            >
            <button
              (click)="isOpen.set(false)"
              class="text-neutral-500 hover:text-neutral-200 text-xs px-2 py-0.5 border border-neutral-800 hover:border-neutral-600"
            >
              [ESC / PECHAR]
            </button>
          </div>

          <!-- Caixa de Busca -->
          <div class="p-4 border-b border-neutral-800 bg-neutral-900/50">
            <div
              class="flex items-center gap-2 border border-neutral-800 bg-neutral-950 px-3 py-2 focus-within:border-neutral-500"
            >
              <span class="text-neutral-500 text-xs">></span>
              <input
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                placeholder="Buscar porto ou ría (ex: Vigo, Muros, Coruña)..."
                class="w-full bg-transparent text-sm text-neutral-100 placeholder-neutral-600 focus:outline-hidden"
                autofocus
              />
              @if (searchQuery()) {
                <button
                  (click)="searchQuery.set('')"
                  class="text-xs text-neutral-500 hover:text-neutral-300"
                >
                  [LIMPAR]
                </button>
              }
            </div>
          </div>

          <!-- Listaxe de Portos -->
          <div class="overflow-y-auto p-2 divide-y divide-neutral-900">
            @for (port of filteredPorts(); track port.id + port.name) {
              <div
                (click)="onSelect(port)"
                class="p-3 flex justify-between items-center hover:bg-neutral-900 cursor-pointer group transition-colors"
                [class.bg-neutral-900]="port.name === activePort()?.name"
              >
                <div>
                  <div
                    class="text-sm text-neutral-200 group-hover:text-white font-medium"
                  >
                    {{ port.name }}
                  </div>
                  <div class="text-[11px] text-neutral-500 mt-0.5">
                    {{ port.zone }} · {{ port.lat.toFixed(3) }}°N,
                    {{ port.lng.toFixed(3) }}°W
                  </div>
                </div>

                <div
                  class="text-xs text-neutral-600 group-hover:text-neutral-400"
                >
                  @if (port.name === activePort()?.name) {
                    <span class="text-neutral-300 font-bold">[ACTIVO]</span>
                  } @else {
                    <span>SELECCIONAR</span>
                  }
                </div>
              </div>
            } @empty {
              <div class="p-8 text-center text-xs text-neutral-600">
                NON SE ATOPARON PORTOS PARA "{{ searchQuery() }}"
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class PortSelectorComponent {
  private portService = inject(PortService);

  isOpen = signal<boolean>(false);
  searchQuery = signal<string>('');

  activePort = this.portService.selectedPort;

  filteredPorts = computed(() => {
    return this.portService.getPortByName(this.searchQuery());
  });

  onSelect(port: Port): void {
    this.portService.selectPort(port);
    this.isOpen.set(false);
  }
}
