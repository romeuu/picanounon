import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'galicianSelectorDay',
})
export class GalicianSelectorDayPipe implements PipeTransform {
  transform(value: Date, ...args: unknown[]): string | null {
    if (!value) return null;

    const daysInGalician = ['DOM', 'LUN', 'MAR', 'MER', 'XOV', 'VEN', 'SAB'];

    return daysInGalician[value.getDay()] + '(' + value.getDate() + ')';
  }
}
