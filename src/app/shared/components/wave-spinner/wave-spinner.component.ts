import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-wave-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wave-spinner.component.html',
  styleUrl: './wave-spinner.component.css',
})
export class WaveSpinnerComponent {
  private readonly loadingService = inject(LoadingService);
  readonly isLoading = this.loadingService.isLoading;
}
