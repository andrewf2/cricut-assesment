import { LOADING_STATE, DEFAULT_TEMPERATURE_UNIT } from 'lib';
import { WeatherState, TemperatureUnit } from './weather-state.model';

export type { WeatherState, TemperatureUnit };

export const initialWeatherState: WeatherState = {
  searchQuery: '',
  searchResults: [],
  searchLoading: LOADING_STATE.IDLE,
  searchError: null,

  selectedCity: null,

  currentWeather: null,
  forecast: [],
  weatherLoading: LOADING_STATE.IDLE,
  weatherError: null,

  comparisonCity: null,
  comparisonWeather: null,

  temperatureUnit: DEFAULT_TEMPERATURE_UNIT,

  agentMessages: [],
  agentLoading: false,
};
