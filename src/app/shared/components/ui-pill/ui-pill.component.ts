import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ui-pill',
  standalone: true,
  imports: [NgClass],
  templateUrl: './ui-pill.component.html',
  styleUrl: './ui-pill.component.css',
})
export class UiPillComponent {
  @Input() selected = false;
  @Output() clicked = new EventEmitter<void>();
}
