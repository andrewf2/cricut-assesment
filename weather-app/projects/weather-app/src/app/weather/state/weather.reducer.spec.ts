import { weatherReducer } from './weather.reducer';
import { initialWeatherState, WeatherState } from './weather.state';
import * as actions from './weather.actions';
import { City } from '../models/city.model';

describe('weatherReducer', () => {
  const mockCity: City = {
    id: 1,
    name: 'Denver',
    country: 'US',
    admin1: 'Colorado',
    latitude: 39.74,
    longitude: -104.98,
  };

  it('should return initial state for unknown action', () => {
    const result = weatherReducer(undefined as any, { type: 'UNKNOWN' } as any);
    expect(result).toEqual(initialWeatherState);
  });

  describe('Search Cities', () => {
    it('should set searchQuery and searchLoading on searchCities', () => {
      const result = weatherReducer(initialWeatherState, actions.searchCities('Denver'));
      expect(result.searchQuery).toBe('Denver');
      expect(result.searchLoading).toBe('loading');
      expect(result.searchError).toBeNull();
    });

    it('should set searchResults on searchCitiesSuccess', () => {
      const result = weatherReducer(initialWeatherState, actions.searchCitiesSuccess([mockCity]));
      expect(result.searchResults).toEqual([mockCity]);
      expect(result.searchLoading).toBe('loaded');
    });

    it('should set searchError on searchCitiesFailure', () => {
      const result = weatherReducer(initialWeatherState, actions.searchCitiesFailure('Network error'));
      expect(result.searchResults).toEqual([]);
      expect(result.searchLoading).toBe('error');
      expect(result.searchError).toBe('Network error');
    });

    it('should clear search state on clearSearch', () => {
      const dirtyState: WeatherState = {
        ...initialWeatherState,
        searchQuery: 'Denver',
        searchResults: [mockCity],
        searchLoading: 'loaded',
      };
      const result = weatherReducer(dirtyState, actions.clearSearch());
      expect(result.searchQuery).toBe('');
      expect(result.searchResults).toEqual([]);
      expect(result.searchLoading).toBe('idle');
    });
  });

  describe('Select City', () => {
    it('should set selectedCity and clear search on selectCity', () => {
      const state: WeatherState = {
        ...initialWeatherState,
        searchResults: [mockCity],
        searchQuery: 'Denver',
      };
      const result = weatherReducer(state, actions.selectCity(mockCity));
      expect(result.selectedCity).toEqual(mockCity);
      expect(result.searchResults).toEqual([]);
      expect(result.searchQuery).toBe('');
      expect(result.weatherLoading).toBe('loading');
    });
  });

  describe('Load Weather', () => {
    it('should set weatherLoading on loadWeatherSuccess', () => {
      const payload = {
        current: { temperature: 72, apparentTemperature: 70, humidity: 30, windSpeed: 10, weatherCode: 0 },
        forecast: [{ date: '2024-01-01', temperatureMax: 75, temperatureMin: 55, weatherCode: 0, precipitationProbability: 10 }],
      };
      const result = weatherReducer(initialWeatherState, actions.loadWeatherSuccess(payload));
      expect(result.currentWeather).toEqual(payload.current);
      expect(result.forecast).toEqual(payload.forecast);
      expect(result.weatherLoading).toBe('loaded');
    });

    it('should set weatherError on loadWeatherFailure', () => {
      const result = weatherReducer(initialWeatherState, actions.loadWeatherFailure('API error'));
      expect(result.weatherLoading).toBe('error');
      expect(result.weatherError).toBe('API error');
    });
  });

  describe('Toggle Temperature Unit', () => {
    it('should toggle from fahrenheit to celsius', () => {
      const result = weatherReducer(initialWeatherState, actions.toggleTemperatureUnit());
      expect(result.temperatureUnit).toBe('celsius');
    });

    it('should toggle from celsius to fahrenheit', () => {
      const state: WeatherState = { ...initialWeatherState, temperatureUnit: 'celsius' };
      const result = weatherReducer(state, actions.toggleTemperatureUnit());
      expect(result.temperatureUnit).toBe('fahrenheit');
    });
  });
});
