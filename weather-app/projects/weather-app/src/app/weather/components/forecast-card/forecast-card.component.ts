import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DailyForecast } from '../../weather.model';
import { TemperatureUnit } from '../../state/weather.state';
import { TemperaturePipe, DEFAULT_TEMPERATURE_UNIT } from 'lib';
import { WeatherIconPipe } from '../../weather-icon.pipe';

@Component({
    selector: 'app-forecast-card',
    imports: [DatePipe, TemperaturePipe, WeatherIconPipe],
    templateUrl: './forecast-card.component.html',
    styleUrl: './forecast-card.component.scss'
})
export class ForecastCardComponent {
  readonly forecast = input<DailyForecast | null>(null);
  readonly unit = input<TemperatureUnit>(DEFAULT_TEMPERATURE_UNIT);
}
