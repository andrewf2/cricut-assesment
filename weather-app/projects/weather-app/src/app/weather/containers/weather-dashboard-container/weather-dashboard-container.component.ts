import { Component, inject, signal } from '@angular/core';
import { WeatherStore } from '../../state/weather.store';
import { toggleTemperatureUnit, agentLoadWeather } from '../../state/weather.actions';
import { CurrentWeatherComponent } from '../../components/current-weather/current-weather.component';
import { ForecastListComponent } from '../../components/forecast-list/forecast-list.component';
import { ErrorBannerComponent, LoadingSkeletonComponent, AgentChatComponent, AgentMessage, AGENT_ROLE, DEFAULT_ERROR_MESSAGE } from 'lib';
import { WeatherAgentService } from '../../services/weather-agent.service';
import { AGENT_ERROR_PREFIX } from '../../state/weather-state.const';

@Component({
    selector: 'app-weather-dashboard-container',
    imports: [CurrentWeatherComponent, ForecastListComponent, ErrorBannerComponent, LoadingSkeletonComponent, AgentChatComponent],
    templateUrl: './weather-dashboard-container.component.html',
    styleUrl: './weather-dashboard-container.component.scss'
})
export class WeatherDashboardContainerComponent {
  readonly store = inject(WeatherStore);
  private readonly agentService = inject(WeatherAgentService);

  readonly agentMessages = signal<AgentMessage[]>([]);
  readonly agentLoading = signal(false);

  onToggleUnit(): void {
    this.store.dispatch(toggleTemperatureUnit());
  }

  onAgentQuery(query: string): void {
    const currentCity = this.store.selectedCity();
    const context = currentCity
      ? { city: currentCity.name, latitude: currentCity.latitude, longitude: currentCity.longitude, unit: this.store.temperatureUnit() }
      : undefined;

    this.agentMessages.update((msgs) => [
      ...msgs,
      { role: AGENT_ROLE.USER, text: query },
      { role: AGENT_ROLE.AGENT, text: '', loading: true },
    ]);
    this.agentLoading.set(true);

    this.agentService.query(query, context).subscribe({
      next: (response) => {
        const toolCalls = response.toolResults.map((tr) => tr.toolName);

        this.agentMessages.update((msgs) => {
          const updated = msgs.slice(0, -1);
          return [...updated, { role: AGENT_ROLE.AGENT, text: response.message, toolCalls }];
        });
        this.agentLoading.set(false);

        // If the agent returned weather data for a city, update the store atomically
        if (response.data.city && response.data.current) {
          this.store.dispatch(agentLoadWeather({
            city: {
              id: response.data.city.id ?? 0,
              name: response.data.city.name,
              country: response.data.city.country,
              admin1: response.data.city.admin1 ?? undefined,
              latitude: response.data.city.latitude,
              longitude: response.data.city.longitude,
            },
            current: {
              temperature: response.data.current.temperature,
              apparentTemperature: response.data.current.apparentTemperature,
              humidity: response.data.current.humidity,
              windSpeed: response.data.current.windSpeed,
              weatherCode: response.data.current.weatherCode,
            },
            forecast: Array.isArray(response.data.forecast)
              ? response.data.forecast
              : (response.data.forecast as any)?.forecast ?? [],
          }));
        }
      },
      error: (err) => {
        this.agentMessages.update((msgs) => {
          const updated = msgs.slice(0, -1);
          return [...updated, { role: AGENT_ROLE.AGENT, text: `${AGENT_ERROR_PREFIX} ${err?.message ?? DEFAULT_ERROR_MESSAGE}` }];
        });
        this.agentLoading.set(false);
      },
    });
  }
}
