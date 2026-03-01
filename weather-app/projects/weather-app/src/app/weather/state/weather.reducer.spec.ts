import { AGENT_ROLE } from 'lib';
import { weatherReducer } from './weather.reducer';
import { initialWeatherState, WeatherState } from './weather.state';
import * as actions from './weather.actions';
import { City } from '../city.model';
import { AgentResponse } from '../agent-response.model';
import { AGENT_ERROR_PREFIX } from './weather-state.const';

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

  describe('Agent Query', () => {
    it('should append user message and loading placeholder on agentQuery', () => {
      const result = weatherReducer(initialWeatherState, actions.agentQuery('What is the weather?'));
      expect(result.agentMessages.length).toBe(2);
      expect(result.agentMessages[0]).toEqual({ role: AGENT_ROLE.USER, text: 'What is the weather?' });
      expect(result.agentMessages[1]).toEqual({ role: AGENT_ROLE.AGENT, text: '', loading: true });
      expect(result.agentLoading).toBe(true);
    });

    it('should replace loading placeholder with agent response on agentQuerySuccess', () => {
      const stateWithLoading: WeatherState = {
        ...initialWeatherState,
        agentMessages: [
          { role: AGENT_ROLE.USER, text: 'Denver weather' },
          { role: AGENT_ROLE.AGENT, text: '', loading: true },
        ],
        agentLoading: true,
      };
      const response: AgentResponse = {
        message: 'Denver is 68°F and clear.',
        data: {
          city: mockCity,
          current: { temperature: 68, apparentTemperature: 65, humidity: 30, windSpeed: 10, weatherCode: 0 },
          forecast: [{ date: '2024-01-01', temperatureMax: 72, temperatureMin: 50, weatherCode: 0, precipitationProbability: 5 }],
        },
        toolResults: [{ toolName: 'getCurrentWeather', result: {} }],
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      };

      const result = weatherReducer(stateWithLoading, actions.agentQuerySuccess(response));

      expect(result.agentMessages.length).toBe(2);
      expect(result.agentMessages[1].text).toBe('Denver is 68°F and clear.');
      expect(result.agentMessages[1].toolCalls).toEqual(['getCurrentWeather']);
      expect(result.agentLoading).toBe(false);
      expect(result.selectedCity).toEqual(mockCity);
      expect(result.currentWeather!.temperature).toBe(68);
      expect(result.weatherLoading).toBe('loaded');
    });

    it('should not update weather data when response lacks city', () => {
      const stateWithLoading: WeatherState = {
        ...initialWeatherState,
        agentMessages: [
          { role: AGENT_ROLE.USER, text: 'hello' },
          { role: AGENT_ROLE.AGENT, text: '', loading: true },
        ],
        agentLoading: true,
      };
      const response: AgentResponse = {
        message: 'Hello! How can I help?',
        data: {},
        toolResults: [],
        usage: { promptTokens: 50, completionTokens: 20, totalTokens: 70 },
      };

      const result = weatherReducer(stateWithLoading, actions.agentQuerySuccess(response));

      expect(result.agentMessages[1].text).toBe('Hello! How can I help?');
      expect(result.agentLoading).toBe(false);
      expect(result.selectedCity).toBeNull();
      expect(result.currentWeather).toBeNull();
    });

    it('should replace loading placeholder with error on agentQueryFailure', () => {
      const stateWithLoading: WeatherState = {
        ...initialWeatherState,
        agentMessages: [
          { role: AGENT_ROLE.USER, text: 'Denver weather' },
          { role: AGENT_ROLE.AGENT, text: '', loading: true },
        ],
        agentLoading: true,
      };

      const result = weatherReducer(stateWithLoading, actions.agentQueryFailure('Network failure'));

      expect(result.agentMessages.length).toBe(2);
      expect(result.agentMessages[1].text).toContain(AGENT_ERROR_PREFIX);
      expect(result.agentMessages[1].text).toContain('Network failure');
      expect(result.agentLoading).toBe(false);
    });
  });
});
