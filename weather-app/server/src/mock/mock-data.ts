/**
 * Mock data for running the server without a Gemini API key.
 * Provides realistic responses for all endpoints so the frontend
 * works end-to-end during interviews and local development.
 */

export const MOCK_CITIES: Record<string, any[]> = {
  default: [
    { id: 5308655, name: 'Denver', country: 'United States', admin1: 'Colorado', latitude: 39.7392, longitude: -104.9903 },
    { id: 5368361, name: 'Los Angeles', country: 'United States', admin1: 'California', latitude: 34.0522, longitude: -118.2437 },
    { id: 5128581, name: 'New York', country: 'United States', admin1: 'New York', latitude: 40.7128, longitude: -74.006 },
    { id: 4887398, name: 'Chicago', country: 'United States', admin1: 'Illinois', latitude: 41.8781, longitude: -87.6298 },
    { id: 5809844, name: 'Seattle', country: 'United States', admin1: 'Washington', latitude: 47.6062, longitude: -122.3321 },
  ],
};

export const MOCK_CURRENT_WEATHER = {
  temperature: 68.5,
  apparentTemperature: 65.2,
  humidity: 45,
  windSpeed: 12.3,
  weatherCode: 2,
  unit: 'fahrenheit' as const,
};

const MOCK_COMPARISON_WEATHER = {
  temperature: 42.1,
  apparentTemperature: 38.7,
  humidity: 62,
  windSpeed: 8.5,
  weatherCode: 3,
};

export const MOCK_FORECAST = [
  { date: '2026-03-01', temperatureMax: 72, temperatureMin: 52, weatherCode: 2, precipitationProbability: 10 },
  { date: '2026-03-02', temperatureMax: 70, temperatureMin: 48, weatherCode: 3, precipitationProbability: 20 },
  { date: '2026-03-03', temperatureMax: 65, temperatureMin: 45, weatherCode: 61, precipitationProbability: 60 },
  { date: '2026-03-04', temperatureMax: 68, temperatureMin: 46, weatherCode: 3, precipitationProbability: 15 },
  { date: '2026-03-05', temperatureMax: 75, temperatureMin: 54, weatherCode: 0, precipitationProbability: 5 },
  { date: '2026-03-06', temperatureMax: 78, temperatureMin: 56, weatherCode: 0, precipitationProbability: 0 },
  { date: '2026-03-07', temperatureMax: 76, temperatureMin: 55, weatherCode: 1, precipitationProbability: 5 },
];

export function findMockCity(query: string): any[] {
  const q = query.toLowerCase();
  const allCities = MOCK_CITIES.default;
  const matches = allCities.filter(
    (c) => c.name.toLowerCase().includes(q) || c.admin1?.toLowerCase().includes(q),
  );
  return matches.length > 0 ? matches : allCities.slice(0, 3);
}

function isCompareQuery(query: string): boolean {
  const q = query.toLowerCase();
  return q.includes('compare') || q.includes('vs') || q.includes('versus');
}

export function buildMockAgentResponse(query: string): any {
  if (isCompareQuery(query)) {
    return buildMockComparisonResponse(query);
  }
  return buildMockSingleCityResponse(query);
}

function buildMockSingleCityResponse(query: string): any {
  const cities = findMockCity(query);
  const city = cities[0];

  return {
    message: `${city.name} is currently ${MOCK_CURRENT_WEATHER.temperature}°F with partly cloudy skies and ${MOCK_CURRENT_WEATHER.humidity}% humidity. Wind is ${MOCK_CURRENT_WEATHER.windSpeed} mph. The week ahead looks mostly sunny with highs in the 70s.`,
    data: {
      city,
      current: MOCK_CURRENT_WEATHER,
      forecast: MOCK_FORECAST,
      cities,
    },
    toolResults: [
      { toolName: 'searchCities', result: { query, cities } },
      { toolName: 'getCurrentWeather', result: MOCK_CURRENT_WEATHER },
      { toolName: 'getForecast', result: { forecast: MOCK_FORECAST, unit: 'fahrenheit' } },
    ],
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
  };
}

function buildMockComparisonResponse(query: string): any {
  const allCities = MOCK_CITIES.default;
  const city1 = allCities[0];
  const city2 = allCities[2];

  return {
    message: `Here's a comparison: ${city1.name} is ${MOCK_CURRENT_WEATHER.temperature}°F with ${MOCK_CURRENT_WEATHER.humidity}% humidity, while ${city2.name} is ${MOCK_COMPARISON_WEATHER.temperature}°F with ${MOCK_COMPARISON_WEATHER.humidity}% humidity. ${city1.name} is warmer by about ${(MOCK_CURRENT_WEATHER.temperature - MOCK_COMPARISON_WEATHER.temperature).toFixed(0)}°F.`,
    data: {
      comparison: {
        location1: { name: city1.name, ...MOCK_CURRENT_WEATHER },
        location2: { name: city2.name, ...MOCK_COMPARISON_WEATHER },
        unit: 'fahrenheit',
      },
    },
    toolResults: [
      { toolName: 'searchCities', result: { query: city1.name, cities: [city1] } },
      { toolName: 'searchCities', result: { query: city2.name, cities: [city2] } },
      { toolName: 'compareWeather', result: { location1: city1.name, location2: city2.name } },
    ],
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
  };
}
