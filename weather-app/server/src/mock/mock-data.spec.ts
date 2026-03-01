import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MOCK_CITIES,
  MOCK_CURRENT_WEATHER,
  MOCK_FORECAST,
  findMockCity,
  buildMockAgentResponse,
} from './mock-data.js';

describe('mock-data', () => {
  describe('MOCK_CITIES', () => {
    it('should have a default list of cities', () => {
      assert.ok(Array.isArray(MOCK_CITIES.default));
      assert.ok(MOCK_CITIES.default.length > 0);
    });

    it('each city should have required fields', () => {
      for (const city of MOCK_CITIES.default) {
        assert.ok(typeof city.id === 'number');
        assert.ok(typeof city.name === 'string');
        assert.ok(typeof city.country === 'string');
        assert.ok(typeof city.latitude === 'number');
        assert.ok(typeof city.longitude === 'number');
      }
    });
  });

  describe('MOCK_CURRENT_WEATHER', () => {
    it('should have all required weather fields', () => {
      assert.ok(typeof MOCK_CURRENT_WEATHER.temperature === 'number');
      assert.ok(typeof MOCK_CURRENT_WEATHER.apparentTemperature === 'number');
      assert.ok(typeof MOCK_CURRENT_WEATHER.humidity === 'number');
      assert.ok(typeof MOCK_CURRENT_WEATHER.windSpeed === 'number');
      assert.ok(typeof MOCK_CURRENT_WEATHER.weatherCode === 'number');
      assert.equal(MOCK_CURRENT_WEATHER.unit, 'fahrenheit');
    });
  });

  describe('MOCK_FORECAST', () => {
    it('should have 7 days of forecast', () => {
      assert.equal(MOCK_FORECAST.length, 7);
    });

    it('each day should have required fields', () => {
      for (const day of MOCK_FORECAST) {
        assert.ok(typeof day.date === 'string');
        assert.ok(typeof day.temperatureMax === 'number');
        assert.ok(typeof day.temperatureMin === 'number');
        assert.ok(typeof day.weatherCode === 'number');
        assert.ok(typeof day.precipitationProbability === 'number');
      }
    });

    it('max temp should be greater than min temp', () => {
      for (const day of MOCK_FORECAST) {
        assert.ok(day.temperatureMax > day.temperatureMin, `${day.date}: max ${day.temperatureMax} should > min ${day.temperatureMin}`);
      }
    });
  });

  describe('findMockCity', () => {
    it('should find Denver by name', () => {
      const results = findMockCity('Denver');
      assert.ok(results.length >= 1);
      assert.equal(results[0].name, 'Denver');
    });

    it('should be case-insensitive', () => {
      const results = findMockCity('denver');
      assert.ok(results.length >= 1);
      assert.equal(results[0].name, 'Denver');
    });

    it('should match by admin1', () => {
      const results = findMockCity('Colorado');
      assert.ok(results.length >= 1);
      assert.equal(results[0].admin1, 'Colorado');
    });

    it('should return fallback cities for unmatched query', () => {
      const results = findMockCity('xyznonexistent');
      assert.ok(results.length > 0);
      assert.equal(results.length, 3);
    });

    it('should find multiple matches', () => {
      const results = findMockCity('New');
      assert.ok(results.length >= 1);
      assert.ok(results.some((c: any) => c.name === 'New York'));
    });
  });

  describe('buildMockAgentResponse', () => {
    it('should return a valid agent response shape', () => {
      const response = buildMockAgentResponse('Denver weather');
      assert.ok(typeof response.message === 'string');
      assert.ok(response.data);
      assert.ok(response.data.city);
      assert.ok(response.data.current);
      assert.ok(Array.isArray(response.data.forecast));
      assert.ok(Array.isArray(response.toolResults));
      assert.ok(response.usage);
    });

    it('should include the matched city in data', () => {
      const response = buildMockAgentResponse('Denver');
      assert.equal(response.data.city.name, 'Denver');
    });

    it('should include current weather data', () => {
      const response = buildMockAgentResponse('Denver');
      assert.equal(response.data.current.temperature, MOCK_CURRENT_WEATHER.temperature);
    });

    it('should include 7-day forecast', () => {
      const response = buildMockAgentResponse('Denver');
      assert.equal(response.data.forecast.length, 7);
    });

    it('should include 3 tool results', () => {
      const response = buildMockAgentResponse('Denver');
      assert.equal(response.toolResults.length, 3);
      assert.equal(response.toolResults[0].toolName, 'searchCities');
      assert.equal(response.toolResults[1].toolName, 'getCurrentWeather');
      assert.equal(response.toolResults[2].toolName, 'getForecast');
    });

    it('should include zero usage for mock responses', () => {
      const response = buildMockAgentResponse('Denver');
      assert.equal(response.usage.totalTokens, 0);
    });

    it('should include city name in message', () => {
      const response = buildMockAgentResponse('Denver');
      assert.ok(response.message.includes('Denver'));
    });

    it('should fallback gracefully for unknown queries', () => {
      const response = buildMockAgentResponse('xyznonexistent');
      assert.ok(response.data.city);
      assert.ok(typeof response.data.city.name === 'string');
    });
  });
});
