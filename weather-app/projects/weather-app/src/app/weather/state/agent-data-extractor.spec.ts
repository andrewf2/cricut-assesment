import { LOADING_STATE } from 'lib';
import { extractWeatherFromAgentData } from './agent-data-extractor';
import { AgentResponseData, AgentToolResult } from '../agent-response.model';
import { City } from '../city.model';
import { CurrentWeather, DailyForecast } from '../weather.model';

describe('extractWeatherFromAgentData', () => {
  const mockCity: City = { id: 1, name: 'Denver', country: 'US', latitude: 39.74, longitude: -104.98 };

  const mockCurrent: CurrentWeather = {
    temperature: 68, apparentTemperature: 65, humidity: 30, windSpeed: 10, weatherCode: 0,
  };

  const mockForecast: DailyForecast[] = [
    { date: '2024-01-01', temperatureMax: 72, temperatureMin: 50, weatherCode: 0, precipitationProbability: 5 },
  ];

  const comparisonLocation1 = {
    name: 'Denver', temperature: 68, apparentTemperature: 65, humidity: 30, windSpeed: 10, weatherCode: 0,
  };

  const comparisonLocation2 = {
    name: 'New York', temperature: 42, apparentTemperature: 38, humidity: 62, windSpeed: 8, weatherCode: 3,
  };

  it('should return empty object when data has no recognized shape', () => {
    const result = extractWeatherFromAgentData({});
    expect(result).toEqual({});
  });

  describe('single city', () => {
    it('should extract city, weather, and forecast', () => {
      const data: AgentResponseData = { city: mockCity, current: mockCurrent, forecast: mockForecast };
      const result = extractWeatherFromAgentData(data);

      expect(result.selectedCity).toEqual(mockCity);
      expect(result.currentWeather).toEqual(mockCurrent);
      expect(result.forecast).toEqual(mockForecast);
      expect(result.weatherLoading).toBe(LOADING_STATE.LOADED);
      expect(result.comparisonCity).toBeNull();
      expect(result.comparisonWeather).toBeNull();
    });

    it('should default forecast to empty array when missing', () => {
      const data: AgentResponseData = { city: mockCity, current: mockCurrent };
      const result = extractWeatherFromAgentData(data);

      expect(result.forecast).toEqual([]);
    });

    it('should clear search state', () => {
      const data: AgentResponseData = { city: mockCity, current: mockCurrent };
      const result = extractWeatherFromAgentData(data);

      expect(result.searchResults).toEqual([]);
      expect(result.searchQuery).toBe('');
      expect(result.searchLoading).toBe(LOADING_STATE.IDLE);
    });
  });

  describe('comparison from data', () => {
    it('should extract both locations when data.comparison has weather data', () => {
      const data: AgentResponseData = {
        comparison: { location1: comparisonLocation1, location2: comparisonLocation2, unit: 'fahrenheit' },
      };
      const result = extractWeatherFromAgentData(data);

      expect(result.selectedCity?.name).toBe('Denver');
      expect(result.currentWeather?.temperature).toBe(68);
      expect(result.comparisonCity?.name).toBe('New York');
      expect(result.comparisonWeather?.temperature).toBe(42);
      expect(result.forecast).toEqual([]);
      expect(result.weatherLoading).toBe(LOADING_STATE.LOADED);
    });

    it('should set comparisonCity to null when location2 is missing', () => {
      const data: AgentResponseData = {
        comparison: { location1: comparisonLocation1 },
      };
      const result = extractWeatherFromAgentData(data);

      expect(result.selectedCity?.name).toBe('Denver');
      expect(result.comparisonCity).toBeNull();
      expect(result.comparisonWeather).toBeNull();
    });

    it('should use apparentTemperature fallback to temperature when missing', () => {
      const locNoApparent = { name: 'Test', temperature: 70, humidity: 50, windSpeed: 5, weatherCode: 1 };
      const data: AgentResponseData = {
        comparison: { location1: locNoApparent, location2: comparisonLocation2 },
      };
      const result = extractWeatherFromAgentData(data);

      expect(result.currentWeather?.apparentTemperature).toBe(70);
    });
  });

  describe('comparison fallback to toolResults', () => {
    const toolResults: AgentToolResult[] = [
      { toolName: 'searchCities', result: { query: 'Denver', cities: [] } },
      {
        toolName: 'compareWeather',
        result: { location1: comparisonLocation1, location2: comparisonLocation2, unit: 'fahrenheit' },
      },
    ];

    it('should fall back to toolResults when data.comparison lacks weather data', () => {
      const data: AgentResponseData = {
        comparison: { location1: { name: 'Denver', latitude: 39.74, longitude: -104.98 } },
      };
      const result = extractWeatherFromAgentData(data, toolResults);

      expect(result.selectedCity?.name).toBe('Denver');
      expect(result.currentWeather?.temperature).toBe(68);
      expect(result.comparisonCity?.name).toBe('New York');
      expect(result.comparisonWeather?.temperature).toBe(42);
    });

    it('should fall back to toolResults when data.comparison is missing entirely', () => {
      const result = extractWeatherFromAgentData({}, toolResults);

      expect(result.selectedCity?.name).toBe('Denver');
      expect(result.currentWeather?.temperature).toBe(68);
      expect(result.comparisonCity?.name).toBe('New York');
    });

    it('should prefer data.comparison when it has full weather data', () => {
      const overrideLoc1 = { ...comparisonLocation1, temperature: 99 };
      const data: AgentResponseData = {
        comparison: { location1: overrideLoc1, location2: comparisonLocation2 },
      };
      const result = extractWeatherFromAgentData(data, toolResults);

      expect(result.currentWeather?.temperature).toBe(99);
    });

    it('should return empty object when neither data nor toolResults have comparison', () => {
      const emptyToolResults: AgentToolResult[] = [
        { toolName: 'searchCities', result: {} },
      ];
      const result = extractWeatherFromAgentData({}, emptyToolResults);

      expect(result).toEqual({});
    });
  });
});
