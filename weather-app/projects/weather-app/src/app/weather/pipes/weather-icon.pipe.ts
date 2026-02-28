import { Pipe, PipeTransform } from '@angular/core';
import { WEATHER_CODE_MAP } from '../models/weather-code.map';
import { UNKNOWN_WEATHER_CODE } from '../models/models.const';

@Pipe({ name: 'weatherIcon' })
export class WeatherIconPipe implements PipeTransform {
  transform(code: number | null | undefined): string {
    if (code == null) return UNKNOWN_WEATHER_CODE.emoji;
    return WEATHER_CODE_MAP[code]?.emoji ?? UNKNOWN_WEATHER_CODE.emoji;
  }
}
