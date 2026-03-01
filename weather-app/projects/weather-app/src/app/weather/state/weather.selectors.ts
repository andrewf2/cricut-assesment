import { createSelector, LOADING_STATE } from 'lib';
import { WeatherState } from './weather.state';

export const selectSearchQuery = (state: WeatherState) => state.searchQuery;
export const selectSearchResults = (state: WeatherState) => state.searchResults;
export const selectSearchLoading = (state: WeatherState) => state.searchLoading;
export const selectSearchError = (state: WeatherState) => state.searchError;

export const selectSelectedCity = (state: WeatherState) => state.selectedCity;

export const selectCurrentWeather = (state: WeatherState) => state.currentWeather;
export const selectForecast = (state: WeatherState) => state.forecast;
export const selectWeatherLoading = (state: WeatherState) => state.weatherLoading;
export const selectWeatherError = (state: WeatherState) => state.weatherError;

export const selectTemperatureUnit = (state: WeatherState) => state.temperatureUnit;

export const selectAgentMessages = (state: WeatherState) => state.agentMessages;
export const selectAgentLoading = (state: WeatherState) => state.agentLoading;

export const selectIsSearching = createSelector<WeatherState, string, boolean>(
  selectSearchLoading,
  (loading) => loading === LOADING_STATE.LOADING,
);

export const selectHasWeatherData = createSelector<WeatherState, ReturnType<typeof selectCurrentWeather>, ReturnType<typeof selectForecast>, boolean>(
  selectCurrentWeather,
  selectForecast,
  (current, forecast) => current !== null && forecast.length > 0,
);

export const selectHasSearchResults = createSelector<WeatherState, ReturnType<typeof selectSearchResults>, string, boolean>(
  selectSearchResults,
  selectSearchLoading,
  (results, loading) => results.length > 0 && loading === LOADING_STATE.LOADED,
);

export const selectIsWeatherLoading = createSelector<WeatherState, string, boolean>(
  selectWeatherLoading,
  (loading) => loading === LOADING_STATE.LOADING,
);
