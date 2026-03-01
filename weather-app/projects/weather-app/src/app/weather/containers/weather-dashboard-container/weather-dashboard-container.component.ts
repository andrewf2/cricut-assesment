import { Component, inject } from '@angular/core';
import { WeatherStore } from '../../state/weather.store';
import { toggleTemperatureUnit, agentQuery } from '../../state/weather.actions';
import { CurrentWeatherComponent } from '../../components/current-weather/current-weather.component';
import { ForecastListComponent } from '../../components/forecast-list/forecast-list.component';
import { ErrorBannerComponent, LoadingSkeletonComponent, AgentChatComponent, ButtonComponent } from 'lib';

@Component({
    selector: 'app-weather-dashboard-container',
    imports: [CurrentWeatherComponent, ForecastListComponent, ErrorBannerComponent, LoadingSkeletonComponent, AgentChatComponent, ButtonComponent],
    templateUrl: './weather-dashboard-container.component.html',
    styleUrl: './weather-dashboard-container.component.scss'
})
export class WeatherDashboardContainerComponent {
  private readonly store = inject(WeatherStore);

  readonly agentMessages = this.store.agentMessages;
  readonly agentLoading = this.store.agentLoading;
  readonly isWeatherLoading = this.store.isWeatherLoading;
  readonly weatherError = this.store.weatherError;
  readonly hasWeatherData = this.store.hasWeatherData;
  readonly currentWeather = this.store.currentWeather;
  readonly selectedCity = this.store.selectedCity;
  readonly temperatureUnit = this.store.temperatureUnit;
  readonly forecast = this.store.forecast;
  readonly comparisonCity = this.store.comparisonCity;
  readonly comparisonWeather = this.store.comparisonWeather;

  onToggleUnit(): void {
    this.store.dispatch(toggleTemperatureUnit());
  }

  onAgentQuery(query: string): void {
    this.store.dispatch(agentQuery(query));
  }
}
