import { Component, model, OnInit, output, signal } from '@angular/core';
import { GalicianSelectorDayPipe } from '../../pipes/galician-selector-day.pipe';
import { UiPillComponent } from '../ui-pill/ui-pill.component';

@Component({
  selector: 'app-day-selector',
  standalone: true,
  imports: [UiPillComponent, GalicianSelectorDayPipe],
  templateUrl: './day-selector.component.html',
  styleUrl: './day-selector.component.css',
})
export class DaySelectorComponent implements OnInit {
  nextDays = signal<Date[]>([]);
  daySelected = model<Date | undefined>(undefined);
  selection = output<Date>();

  ngOnInit(): void {
    const following = this.getFollowingDays();
    this.nextDays.set(following);
    if (!this.daySelected()) {
      this.daySelected.set(following[0]);
    }
  }

  getFollowingDays(): Date[] {
    const dates: Date[] = [];
    const today = new Date();

    for (let i = 0; i < 5; i++) {
      dates.push(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + i),
      );
    }

    return dates;
  }

  selectDate(day: Date): void {
    this.daySelected.set(day);
    this.selection.emit(day);
  }

  isDateSelected(day: Date): boolean {
    const selected = this.daySelected();
    if (!selected) return false;
    return (
      day.getFullYear() === selected.getFullYear() &&
      day.getMonth() === selected.getMonth() &&
      day.getDate() === selected.getDate()
    );
  }
}
