import { AgentMessage, LoadingState } from 'lib';
import { City } from '../city.model';
import { CurrentWeather, DailyForecast } from '../weather.model';

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface WeatherState {
  searchQuery: string;
  searchResults: City[];
  searchLoading: LoadingState;
  searchError: string | null;

  selectedCity: City | null;

  currentWeather: CurrentWeather | null;
  forecast: DailyForecast[];
  weatherLoading: LoadingState;
  weatherError: string | null;

  temperatureUnit: TemperatureUnit;

  agentMessages: AgentMessage[];
  agentLoading: boolean;
}
