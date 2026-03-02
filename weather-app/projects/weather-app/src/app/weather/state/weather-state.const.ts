export const SEARCH_DEBOUNCE_MS = 300;
export const MIN_SEARCH_LENGTH = 2;

export const WEATHER_RETRY_CONFIG = {
  maxRetries: 2,
  initialDelay: 1000,
} as const;

export const SEARCH_FAILED_MESSAGE = 'Search failed';
export const WEATHER_LOAD_FAILED_MESSAGE = 'Failed to load weather';
export const AGENT_ERROR_PREFIX = 'Sorry, something went wrong:';

export const AGENT_TOOL_NAME = {
  COMPARE_WEATHER: 'compareWeather',
} as const;

export const COMPARISON_KEY = {
  LOCATION_1: 'location1',
  LOCATION_2: 'location2',
  TEMPERATURE: 'temperature',
  APPARENT_TEMPERATURE: 'apparentTemperature',
  HUMIDITY: 'humidity',
  WIND_SPEED: 'windSpeed',
  WEATHER_CODE: 'weatherCode',
  NAME: 'name',
} as const;
