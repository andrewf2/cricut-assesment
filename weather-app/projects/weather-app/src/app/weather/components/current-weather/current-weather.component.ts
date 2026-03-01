import { Component, input } from '@angular/core';
import { CurrentWeather } from '../../weather.model';
import { City } from '../../city.model';
import { TemperatureUnit } from '../../state/weather.state';
import { TemperaturePipe, DEFAULT_TEMPERATURE_UNIT } from 'lib';
import { WeatherIconPipe } from '../../weather-icon.pipe';
import { WEATHER_CODE_MAP } from '../../weather-code.map';
import { UNKNOWN_WEATHER_CODE } from '../../models.const';

@Component({
    selector: 'app-current-weather',
    imports: [TemperaturePipe, WeatherIconPipe],
    templateUrl: './current-weather.component.html',
    styleUrl: './current-weather.component.scss'
})
export class CurrentWeatherComponent {
  readonly weather = input<CurrentWeather | null>(null);
  readonly city = input<City | null>(null);
  readonly unit = input<TemperatureUnit>(DEFAULT_TEMPERATURE_UNIT);

  getWeatherLabel(code: number): string {
    return WEATHER_CODE_MAP[code]?.label ?? UNKNOWN_WEATHER_CODE.label;
  }
}
