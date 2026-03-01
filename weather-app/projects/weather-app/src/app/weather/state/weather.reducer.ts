import { createReducer, on, LOADING_STATE, TEMPERATURE_UNIT, AGENT_ROLE } from 'lib';
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
  agentQuery,
  agentQuerySuccess,
  agentQueryFailure,
} from './weather.actions';
import { WeatherState, initialWeatherState } from './weather.state';
import { AGENT_ERROR_PREFIX } from './weather-state.const';
import { AgentResponse } from '../agent-response.model';
import { extractWeatherFromAgentData } from './agent-data-extractor';

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
    comparisonCity: null,
    comparisonWeather: null,
    weatherLoading: LOADING_STATE.LOADED,
  })),

  on(loadWeatherFailure, (state, { payload }) => ({
    ...state,
    weatherLoading: LOADING_STATE.ERROR,
    weatherError: payload,
  })),

  on(toggleTemperatureUnit, (state) => ({
    ...state,
    temperatureUnit: state.temperatureUnit === TEMPERATURE_UNIT.CELSIUS
      ? TEMPERATURE_UNIT.FAHRENHEIT
      : TEMPERATURE_UNIT.CELSIUS,
  })),

  on(agentQuery, (state, { payload }) => ({
    ...state,
    agentMessages: [
      ...state.agentMessages,
      { role: AGENT_ROLE.USER, text: payload },
      { role: AGENT_ROLE.AGENT, text: '', loading: true },
    ],
    agentLoading: true,
    weatherLoading: LOADING_STATE.LOADING,
  })),

  on(agentQuerySuccess, (state, { payload }) => {
    const toolCalls = payload.toolResults.map((tr) => tr.toolName);
    const messages = [
      ...state.agentMessages.slice(0, -1),
      { role: AGENT_ROLE.AGENT, text: payload.message, toolCalls },
    ];
    const weatherUpdate = extractWeatherFromAgentData(payload.data);

    return {
      ...state,
      agentMessages: messages,
      agentLoading: false,
      ...weatherUpdate,
    };
  }),

  on(agentQueryFailure, (state, { payload }) => ({
    ...state,
    agentMessages: [
      ...state.agentMessages.slice(0, -1),
      { role: AGENT_ROLE.AGENT, text: `${AGENT_ERROR_PREFIX} ${payload}` },
    ],
    agentLoading: false,
  })),
);
