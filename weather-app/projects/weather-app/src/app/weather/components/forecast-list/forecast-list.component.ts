import { Component, input } from '@angular/core';
import { DailyForecast } from '../../models/weather.model';
import { TemperatureUnit } from '../../state/weather.state';
import { DEFAULT_TEMPERATURE_UNIT } from 'lib';
import { ForecastCardComponent } from '../forecast-card/forecast-card.component';

@Component({
    selector: 'app-forecast-list',
    imports: [ForecastCardComponent],
    templateUrl: './forecast-list.component.html',
    styleUrl: './forecast-list.component.scss'
})
export class ForecastListComponent {
  readonly forecast = input<DailyForecast[]>([]);
  readonly unit = input<TemperatureUnit>(DEFAULT_TEMPERATURE_UNIT);
}
