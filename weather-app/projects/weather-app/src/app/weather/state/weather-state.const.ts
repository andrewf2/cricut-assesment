export const SEARCH_DEBOUNCE_MS = 300;
export const MIN_SEARCH_LENGTH = 2;

export const WEATHER_RETRY_CONFIG = {
  maxRetries: 2,
  initialDelay: 1000,
} as const;

export const SEARCH_FAILED_MESSAGE = 'Search failed';
export const WEATHER_LOAD_FAILED_MESSAGE = 'Failed to load weather';
export const AGENT_ERROR_PREFIX = 'Sorry, something went wrong:';
