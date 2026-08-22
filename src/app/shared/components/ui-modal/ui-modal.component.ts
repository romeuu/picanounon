import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ui-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-modal.component.html',
  styleUrl: './ui-modal.component.css',
})
export class UiModalComponent {
  @Input() isOpen = false;
  @Input() title?: string;
  @Input() maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'lg';

  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.closed.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }

  get maxWidthClass(): string {
    switch (this.maxWidth) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'xl':
        return 'max-w-xl';
      case '2xl':
        return 'max-w-2xl';
      case 'lg':
      default:
        return 'max-w-lg';
    }
  }
}
