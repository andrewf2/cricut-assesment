import { LOADING_STATE } from 'lib';
import { AgentResponseData, AgentToolResult } from '../agent-response.model';
import { City } from '../city.model';
import { CurrentWeather, DailyForecast } from '../weather.model';
import { WeatherState } from './weather-state.model';
import { AGENT_TOOL_NAME, COMPARISON_KEY } from './weather-state.const';

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
  data: AgentResponseData,
  toolResults?: readonly AgentToolResult[],
): Partial<WeatherStateSlice> {
  if (data.city && data.current) {
    return buildSingleCityUpdate(data.city, data.current, data.forecast);
  }

  const comparison = resolveComparison(data, toolResults);
  if (comparison?.[COMPARISON_KEY.LOCATION_1]) {
    return buildComparisonUpdate(comparison);
  }
  return {};
}

function resolveComparison(
  data: AgentResponseData,
  toolResults?: readonly AgentToolResult[],
): Record<string, any> | undefined {
  const fromData = data.comparison;
  if (fromData?.[COMPARISON_KEY.LOCATION_1]?.[COMPARISON_KEY.TEMPERATURE] !== undefined) {
    return fromData;
  }

  const toolResult = toolResults?.find((tr) => tr.toolName === AGENT_TOOL_NAME.COMPARE_WEATHER);
  if (toolResult?.result?.[COMPARISON_KEY.LOCATION_1]) {
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
  return { id: 0, name: loc[COMPARISON_KEY.NAME], country: '', latitude: 0, longitude: 0 };
}

function mapLocationToWeather(loc: Record<string, any>): CurrentWeather {
  return {
    temperature: loc[COMPARISON_KEY.TEMPERATURE],
    apparentTemperature: loc[COMPARISON_KEY.APPARENT_TEMPERATURE] ?? loc[COMPARISON_KEY.TEMPERATURE],
    humidity: loc[COMPARISON_KEY.HUMIDITY],
    windSpeed: loc[COMPARISON_KEY.WIND_SPEED],
    weatherCode: loc[COMPARISON_KEY.WEATHER_CODE],
  };
}

function buildComparisonUpdate(
  comparison: Record<string, any>,
): Partial<WeatherStateSlice> {
  const loc1 = comparison[COMPARISON_KEY.LOCATION_1];
  const loc2 = comparison[COMPARISON_KEY.LOCATION_2];

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
