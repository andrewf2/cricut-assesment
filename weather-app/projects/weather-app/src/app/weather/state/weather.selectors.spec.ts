import * as selectors from './weather.selectors';
import { initialWeatherState, WeatherState } from './weather.state';

describe('Weather Selectors', () => {
  describe('base selectors', () => {
    it('selectSearchQuery should return searchQuery', () => {
      const state: WeatherState = { ...initialWeatherState, searchQuery: 'Denver' };
      expect(selectors.selectSearchQuery(state)).toBe('Denver');
    });

    it('selectSelectedCity should return selectedCity', () => {
      expect(selectors.selectSelectedCity(initialWeatherState)).toBeNull();
    });

    it('selectTemperatureUnit should return temperatureUnit', () => {
      expect(selectors.selectTemperatureUnit(initialWeatherState)).toBe('fahrenheit');
    });
  });

  describe('composed selectors', () => {
    it('selectIsSearching should return true when loading', () => {
      const state: WeatherState = { ...initialWeatherState, searchLoading: 'loading' };
      expect(selectors.selectIsSearching(state)).toBe(true);
    });

    it('selectIsSearching should return false when idle', () => {
      expect(selectors.selectIsSearching(initialWeatherState)).toBe(false);
    });

    it('selectHasWeatherData should return true when current and forecast exist', () => {
      const state: WeatherState = {
        ...initialWeatherState,
        currentWeather: { temperature: 72, apparentTemperature: 70, humidity: 30, windSpeed: 10, weatherCode: 0 },
        forecast: [{ date: '2024-01-01', temperatureMax: 75, temperatureMin: 55, weatherCode: 0, precipitationProbability: 10 }],
      };
      expect(selectors.selectHasWeatherData(state)).toBe(true);
    });

    it('selectHasWeatherData should return false when no data', () => {
      expect(selectors.selectHasWeatherData(initialWeatherState)).toBe(false);
    });

    it('selectHasSearchResults should return true when results exist and loaded', () => {
      const state: WeatherState = {
        ...initialWeatherState,
        searchResults: [{ id: 1, name: 'Denver', country: 'US', latitude: 39.74, longitude: -104.98 }],
        searchLoading: 'loaded',
      };
      expect(selectors.selectHasSearchResults(state)).toBe(true);
    });

    describe('memoization', () => {
      it('selectHasWeatherData should return same reference for same inputs', () => {
        const state: WeatherState = {
          ...initialWeatherState,
          currentWeather: { temperature: 72, apparentTemperature: 70, humidity: 30, windSpeed: 10, weatherCode: 0 },
          forecast: [{ date: '2024-01-01', temperatureMax: 75, temperatureMin: 55, weatherCode: 0, precipitationProbability: 10 }],
        };
        const result1 = selectors.selectHasWeatherData(state);
        const result2 = selectors.selectHasWeatherData(state);
        expect(result1).toBe(result2);
      });
    });
  });
});
