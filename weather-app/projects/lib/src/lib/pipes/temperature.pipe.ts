import { Pipe, PipeTransform } from '@angular/core';
import { TEMPERATURE_UNIT, NULL_TEMPERATURE_DISPLAY } from './temperature.const';

@Pipe({ name: 'temperature' })
export class TemperaturePipe implements PipeTransform {
  transform(value: number | null | undefined, unit: 'celsius' | 'fahrenheit'): string {
    if (value == null) return NULL_TEMPERATURE_DISPLAY;

    if (unit === TEMPERATURE_UNIT.CELSIUS) {
      const celsius = (value - 32) * (5 / 9);
      return `${Math.round(celsius)}°C`;
    }

    return `${Math.round(value)}°F`;
  }
}
