export const API_BASE_URL = 'http://localhost:3000';
export const API_WEATHER_PATH = '/api/weather';

export const API_ENDPOINTS = {
  AGENT: `${API_BASE_URL}${API_WEATHER_PATH}/agent`,
} as const;
