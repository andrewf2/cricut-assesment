import { tool } from 'ai';
import { z } from 'zod';

const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_BASE = 'https://api.open-meteo.com/v1/forecast';

/**
 * Agentic weather tools — the AI model decides which to call
 * based on the user's natural-language query.
 */
export const weatherTools = {
  /**
   * Search for cities by name using Open-Meteo Geocoding API.
   * Returns matching cities with lat/lon for follow-up weather calls.
   */
  searchCities: tool({
    description:
      'Search for cities by name. Returns a list of matching cities with their coordinates, country, and region. Use this when the user mentions a city name and you need to find its coordinates before fetching weather.',
    parameters: z.object({
      query: z.string().describe('City name to search for, e.g. "Denver" or "Tokyo"'),
      limit: z.number().optional().default(5).describe('Max results to return (1-10)'),
    }),
    execute: async ({ query, limit }) => {
      console.log(`🔍 Geocoding search: "${query}"`);

      const url = new URL(GEOCODING_BASE);
      url.searchParams.set('name', query);
      url.searchParams.set('count', String(Math.min(limit ?? 5, 10)));
      url.searchParams.set('language', 'en');
      url.searchParams.set('format', 'json');

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Geocoding API error: ${res.status}`);

      const data = (await res.json()) as {
        results?: Array<{
          id: number;
          name: string;
          country: string;
          admin1?: string;
          latitude: number;
          longitude: number;
        }>;
      };

      const cities = (data.results ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        country: r.country,
        admin1: r.admin1 ?? null,
        latitude: r.latitude,
        longitude: r.longitude,
      }));

      console.log(`   → Found ${cities.length} results`);
      return { query, cities };
    },
  }),

  /**
   * Get current weather conditions for a specific lat/lon.
   */
  getCurrentWeather: tool({
    description:
      'Get the current weather conditions (temperature, humidity, wind, weather code) for a given latitude and longitude. Use this after finding a city with searchCities.',
    parameters: z.object({
      latitude: z.number().describe('Latitude of the location'),
      longitude: z.number().describe('Longitude of the location'),
      temperatureUnit: z
        .enum(['fahrenheit', 'celsius'])
        .optional()
        .default('fahrenheit')
        .describe('Temperature unit preference'),
    }),
    execute: async ({ latitude, longitude, temperatureUnit }) => {
      console.log(`🌡️  Current weather for (${latitude}, ${longitude})`);

      const url = new URL(WEATHER_BASE);
      url.searchParams.set('latitude', String(latitude));
      url.searchParams.set('longitude', String(longitude));
      url.searchParams.set(
        'current',
        'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
      );
      url.searchParams.set('temperature_unit', temperatureUnit ?? 'fahrenheit');
      url.searchParams.set('wind_speed_unit', 'mph');

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

      const data = (await res.json()) as {
        current: {
          temperature_2m: number;
          apparent_temperature: number;
          relative_humidity_2m: number;
          wind_speed_10m: number;
          weather_code: number;
        };
      };

      const current = {
        temperature: data.current.temperature_2m,
        apparentTemperature: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        weatherCode: data.current.weather_code,
        unit: temperatureUnit ?? 'fahrenheit',
      };

      console.log(`   → ${current.temperature}°${temperatureUnit === 'celsius' ? 'C' : 'F'}`);
      return current;
    },
  }),

  /**
   * Get a 7-day forecast for a specific lat/lon.
   */
  getForecast: tool({
    description:
      'Get a 7-day weather forecast (daily highs, lows, weather codes, precipitation probability) for a given latitude and longitude.',
    parameters: z.object({
      latitude: z.number().describe('Latitude of the location'),
      longitude: z.number().describe('Longitude of the location'),
      days: z.number().optional().default(7).describe('Number of forecast days (1-16)'),
      temperatureUnit: z
        .enum(['fahrenheit', 'celsius'])
        .optional()
        .default('fahrenheit')
        .describe('Temperature unit preference'),
    }),
    execute: async ({ latitude, longitude, days, temperatureUnit }) => {
      console.log(`📅 ${days ?? 7}-day forecast for (${latitude}, ${longitude})`);

      const url = new URL(WEATHER_BASE);
      url.searchParams.set('latitude', String(latitude));
      url.searchParams.set('longitude', String(longitude));
      url.searchParams.set(
        'daily',
        'temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max',
      );
      url.searchParams.set('temperature_unit', temperatureUnit ?? 'fahrenheit');
      url.searchParams.set('wind_speed_unit', 'mph');
      url.searchParams.set('forecast_days', String(Math.min(days ?? 7, 16)));

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

      const data = (await res.json()) as {
        daily: {
          time: string[];
          temperature_2m_max: number[];
          temperature_2m_min: number[];
          weather_code: number[];
          precipitation_probability_max: number[];
        };
      };

      const forecast = data.daily.time.map((date, i) => ({
        date,
        temperatureMax: data.daily.temperature_2m_max[i],
        temperatureMin: data.daily.temperature_2m_min[i],
        weatherCode: data.daily.weather_code[i],
        precipitationProbability: data.daily.precipitation_probability_max[i],
      }));

      console.log(`   → ${forecast.length} days returned`);
      return { forecast, unit: temperatureUnit ?? 'fahrenheit' };
    },
  }),

  /**
   * Compare weather between two locations.
   */
  compareWeather: tool({
    description:
      'Compare current weather between two locations side by side. Useful when the user asks "Is it warmer in X than Y?" or "Compare weather in X and Y".',
    parameters: z.object({
      location1: z.object({
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      }),
      location2: z.object({
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      }),
      temperatureUnit: z
        .enum(['fahrenheit', 'celsius'])
        .optional()
        .default('fahrenheit'),
    }),
    execute: async ({ location1, location2, temperatureUnit }) => {
      console.log(`⚖️  Comparing weather: ${location1.name} vs ${location2.name}`);

      const unit = temperatureUnit ?? 'fahrenheit';
      const fetchWeather = async (lat: number, lon: number) => {
        const url = new URL(WEATHER_BASE);
        url.searchParams.set('latitude', String(lat));
        url.searchParams.set('longitude', String(lon));
        url.searchParams.set(
          'current',
          'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
        );
        url.searchParams.set('temperature_unit', unit);
        url.searchParams.set('wind_speed_unit', 'mph');
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
        return res.json();
      };

      const [data1, data2] = await Promise.all([
        fetchWeather(location1.latitude, location1.longitude),
        fetchWeather(location2.latitude, location2.longitude),
      ]);

      const mapCurrent = (d: any, name: string) => ({
        name,
        temperature: d.current.temperature_2m,
        apparentTemperature: d.current.apparent_temperature,
        humidity: d.current.relative_humidity_2m,
        windSpeed: d.current.wind_speed_10m,
        weatherCode: d.current.weather_code,
      });

      return {
        location1: mapCurrent(data1, location1.name),
        location2: mapCurrent(data2, location2.name),
        unit,
      };
    },
  }),
};
