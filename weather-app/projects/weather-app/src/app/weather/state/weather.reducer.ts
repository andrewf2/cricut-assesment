import { createReducer, on, LOADING_STATE, TEMPERATURE_UNIT } from 'lib';
import {
  searchCities,
  searchCitiesSuccess,
  searchCitiesFailure,
  clearSearch,
  selectCity,
  loadWeather,
  loadWeatherSuccess,
  loadWeatherFailure,
  toggleTemperatureUnit,
  agentLoadWeather,
} from './weather.actions';
import { WeatherState, initialWeatherState } from './weather.state';

export const weatherReducer = createReducer<WeatherState>(
  initialWeatherState,

  on(searchCities, (state, { payload }) => ({
    ...state,
    searchQuery: payload,
    searchLoading: LOADING_STATE.LOADING,
    searchError: null,
  })),

  on(searchCitiesSuccess, (state, { payload }) => ({
    ...state,
    searchResults: payload,
    searchLoading: LOADING_STATE.LOADED,
  })),

  on(searchCitiesFailure, (state, { payload }) => ({
    ...state,
    searchResults: [],
    searchLoading: LOADING_STATE.ERROR,
    searchError: payload,
  })),

  on(clearSearch, (state) => ({
    ...state,
    searchQuery: '',
    searchResults: [],
    searchLoading: LOADING_STATE.IDLE,
    searchError: null,
  })),

  on(selectCity, (state, { payload }) => ({
    ...state,
    selectedCity: payload,
    searchResults: [],
    searchQuery: '',
    searchLoading: LOADING_STATE.IDLE,
    weatherLoading: LOADING_STATE.LOADING,
    weatherError: null,
  })),

  on(loadWeather, (state) => ({
    ...state,
    weatherLoading: LOADING_STATE.LOADING,
    weatherError: null,
  })),

  on(loadWeatherSuccess, (state, { payload }) => ({
    ...state,
    currentWeather: payload.current,
    forecast: payload.forecast,
    weatherLoading: LOADING_STATE.LOADED,
  })),

  on(loadWeatherFailure, (state, { payload }) => ({
    ...state,
    weatherLoading: LOADING_STATE.ERROR,
    weatherError: payload,
  })),

  on(agentLoadWeather, (state, { payload }) => ({
    ...state,
    selectedCity: payload.city,
    currentWeather: payload.current,
    forecast: payload.forecast,
    weatherLoading: LOADING_STATE.LOADED,
    weatherError: null,
    searchResults: [],
    searchQuery: '',
    searchLoading: LOADING_STATE.IDLE,
  })),

  on(toggleTemperatureUnit, (state) => ({
    ...state,
    temperatureUnit: state.temperatureUnit === TEMPERATURE_UNIT.CELSIUS
      ? TEMPERATURE_UNIT.FAHRENHEIT
      : TEMPERATURE_UNIT.CELSIUS,
  })),
);
