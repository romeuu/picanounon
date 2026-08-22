import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { UiModalComponent } from '../ui-modal/ui-modal.component';

export interface IconCredit {
  name: string;
  author: string;
  file: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, UiModalComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  isModalOpen = signal<boolean>(false);

  readonly credits: IconCredit[] = [
    {
      name: 'Sargo (Fish)',
      author: 'Daria Moskvina',
      file: 'sargos.svg',
    },
    {
      name: 'Robaliza (Sea Bass)',
      author: 'Lars Meiertoberens',
      file: 'robalizas.svg',
    },
    {
      name: 'Agulla (Garfish)',
      author: 'Foxyard Studio',
      file: 'agullas.svg',
    },
    {
      name: 'Información (Info)',
      author: 'moon studio',
      file: 'info.svg',
    },
    {
      name: 'Temperatura da Auga',
      author: 'Candy Design',
      file: 'temperatura-agua.svg',
    },
    {
      name: 'Tempo e Nubes',
      author: 'Dierys Design',
      file: 'prevision-tiempo.svg',
    },
  ];
}
