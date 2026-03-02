import { LOADING_STATE } from 'lib';
import { AgentResponse } from '../agent-response.model';
import { City } from '../city.model';
import { CurrentWeather, DailyForecast } from '../weather.model';
import { WeatherState } from './weather-state.model';

type WeatherStateSlice = Pick<
  WeatherState,
  | 'selectedCity' | 'currentWeather' | 'forecast'
  | 'comparisonCity' | 'comparisonWeather'
  | 'weatherLoading' | 'weatherError'
  | 'searchResults' | 'searchQuery' | 'searchLoading'
>;

const CLEAR_SEARCH: Pick<WeatherStateSlice, 'searchResults' | 'searchQuery' | 'searchLoading'> = {
  searchResults: [],
  searchQuery: '',
  searchLoading: LOADING_STATE.IDLE,
};

/**
 * Extracts displayable weather state from an agent response.
 * Handles both single-city and comparison response shapes.
 * Falls back to raw toolResults when Gemini's JSON text is incomplete.
 */
export function extractWeatherFromAgentData(
  data: AgentResponse['data'],
  toolResults?: AgentResponse['toolResults'],
): Partial<WeatherStateSlice> {
  if (data.city && data.current) {
    return buildSingleCityUpdate(data.city, data.current, data.forecast);
  }

  const comparison = resolveComparison(data, toolResults);
  if (comparison?.['location1']) {
    return buildComparisonUpdate(comparison);
  }
  return {};
}

function resolveComparison(
  data: AgentResponse['data'],
  toolResults?: AgentResponse['toolResults'],
): Record<string, any> | undefined {
  const fromData = data.comparison;
  if (fromData?.['location1']?.['temperature'] !== undefined) {
    return fromData;
  }

  const toolResult = toolResults?.find((tr) => tr.toolName === 'compareWeather');
  if (toolResult?.result?.['location1']) {
    return toolResult.result;
  }

  return fromData;
}

function buildSingleCityUpdate(
  city: City,
  current: CurrentWeather,
  forecast?: DailyForecast[],
): Partial<WeatherStateSlice> {
  return {
    selectedCity: city,
    currentWeather: current,
    forecast: Array.isArray(forecast) ? forecast : [],
    comparisonCity: null,
    comparisonWeather: null,
    weatherLoading: LOADING_STATE.LOADED,
    weatherError: null,
    ...CLEAR_SEARCH,
  };
}

function mapLocationToCity(loc: Record<string, any>): City {
  return { id: 0, name: loc['name'], country: '', latitude: 0, longitude: 0 };
}

function mapLocationToWeather(loc: Record<string, any>): CurrentWeather {
  return {
    temperature: loc['temperature'],
    apparentTemperature: loc['apparentTemperature'] ?? loc['temperature'],
    humidity: loc['humidity'],
    windSpeed: loc['windSpeed'],
    weatherCode: loc['weatherCode'],
  };
}

function buildComparisonUpdate(
  comparison: Record<string, any>,
): Partial<WeatherStateSlice> {
  const loc1 = comparison['location1'];
  const loc2 = comparison['location2'];

  return {
    selectedCity: mapLocationToCity(loc1),
    currentWeather: mapLocationToWeather(loc1),
    comparisonCity: loc2 ? mapLocationToCity(loc2) : null,
    comparisonWeather: loc2 ? mapLocationToWeather(loc2) : null,
    forecast: [],
    weatherLoading: LOADING_STATE.LOADED,
    weatherError: null,
    ...CLEAR_SEARCH,
  };
}
