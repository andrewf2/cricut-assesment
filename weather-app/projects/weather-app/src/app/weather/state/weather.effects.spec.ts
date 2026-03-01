import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { WeatherEffects } from './weather.effects';
import { WeatherStore } from './weather.store';
import { GeocodingApiService } from '../geocoding-api.service';
import { WeatherApiService } from '../weather-api.service';
import { WeatherAgentService } from '../weather-agent.service';
import * as actions from './weather.actions';
import { City } from '../city.model';
import { AgentResponse } from '../agent-response.model';

describe('WeatherEffects', () => {
  let store: WeatherStore;
  let geocodingApi: jasmine.SpyObj<GeocodingApiService>;
  let weatherApi: jasmine.SpyObj<WeatherApiService>;
  let agentService: jasmine.SpyObj<WeatherAgentService>;

  const mockCity: City = { id: 1, name: 'Denver', country: 'US', latitude: 39.74, longitude: -104.98 };

  const mockAgentResponse: AgentResponse = {
    message: 'Denver is 68°F and clear.',
    data: {
      city: mockCity,
      current: { temperature: 68, apparentTemperature: 65, humidity: 30, windSpeed: 10, weatherCode: 0 },
      forecast: [{ date: '2024-01-01', temperatureMax: 72, temperatureMin: 50, weatherCode: 0, precipitationProbability: 5 }],
    },
    toolResults: [{ toolName: 'getCurrentWeather', result: {} }],
    usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
  };

  beforeEach(() => {
    geocodingApi = jasmine.createSpyObj('GeocodingApiService', ['search']);
    weatherApi = jasmine.createSpyObj('WeatherApiService', ['getWeather']);
    agentService = jasmine.createSpyObj('WeatherAgentService', ['query']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WeatherStore,
        WeatherEffects,
        { provide: GeocodingApiService, useValue: geocodingApi },
        { provide: WeatherApiService, useValue: weatherApi },
        { provide: WeatherAgentService, useValue: agentService },
      ],
    });

    store = TestBed.inject(WeatherStore);
  });

  it('should dispatch searchCitiesSuccess on successful search', fakeAsync(() => {
    geocodingApi.search.and.returnValue(of([mockCity]));

    const effects = TestBed.inject(WeatherEffects);
    spyOn(store, 'dispatch').and.callThrough();

    store.dispatch(actions.searchCities('Denver'));
    tick(350); // debounce + processing

    expect(geocodingApi.search).toHaveBeenCalledWith('Denver');
    expect(store.dispatch).toHaveBeenCalledWith(actions.searchCitiesSuccess([mockCity]));
  }));

  it('should dispatch searchCitiesFailure on API error', fakeAsync(() => {
    geocodingApi.search.and.returnValue(throwError(() => new Error('Network error')));

    const effects = TestBed.inject(WeatherEffects);
    spyOn(store, 'dispatch').and.callThrough();

    store.dispatch(actions.searchCities('Denver'));
    tick(350);

    expect(store.dispatch).toHaveBeenCalledWith(actions.searchCitiesFailure('Network error'));
  }));

  it('should dispatch loadWeatherSuccess on selectCity', fakeAsync(() => {
    const mockWeather = {
      current: { temperature: 72, apparentTemperature: 70, humidity: 30, windSpeed: 10, weatherCode: 0 },
      forecast: [{ date: '2024-01-01', temperatureMax: 75, temperatureMin: 55, weatherCode: 0, precipitationProbability: 10 }],
    };
    weatherApi.getWeather.and.returnValue(of(mockWeather));

    const effects = TestBed.inject(WeatherEffects);
    spyOn(store, 'dispatch').and.callThrough();

    store.dispatch(actions.selectCity(mockCity));
    tick(0);

    expect(weatherApi.getWeather).toHaveBeenCalledWith(39.74, -104.98);
    expect(store.dispatch).toHaveBeenCalledWith(actions.loadWeatherSuccess(mockWeather));
  }));

  describe('agent query effect', () => {
    it('should dispatch agentQuerySuccess on successful query', fakeAsync(() => {
      agentService.query.and.returnValue(of(mockAgentResponse));

      const effects = TestBed.inject(WeatherEffects);
      spyOn(store, 'dispatch').and.callThrough();

      store.dispatch(actions.agentQuery('What is the weather in Denver?'));
      tick(0);

      expect(agentService.query).toHaveBeenCalledWith('What is the weather in Denver?', undefined);
      expect(store.dispatch).toHaveBeenCalledWith(actions.agentQuerySuccess(mockAgentResponse));
    }));

    it('should dispatch agentQueryFailure on error', fakeAsync(() => {
      agentService.query.and.returnValue(throwError(() => new Error('Network failure')));

      const effects = TestBed.inject(WeatherEffects);
      spyOn(store, 'dispatch').and.callThrough();

      store.dispatch(actions.agentQuery('Denver weather'));
      tick(0);

      expect(store.dispatch).toHaveBeenCalledWith(actions.agentQueryFailure('Network failure'));
    }));

    it('should pass context from store when city is selected', fakeAsync(() => {
      agentService.query.and.returnValue(of(mockAgentResponse));

      const effects = TestBed.inject(WeatherEffects);

      // First select a city to set store state
      store.dispatch(actions.agentQuerySuccess(mockAgentResponse));

      spyOn(store, 'dispatch').and.callThrough();
      agentService.query.calls.reset();
      agentService.query.and.returnValue(of(mockAgentResponse));

      store.dispatch(actions.agentQuery('forecast'));
      tick(0);

      const callArgs = agentService.query.calls.mostRecent().args;
      expect(callArgs[0]).toBe('forecast');
      expect(callArgs[1]).toEqual({
        city: 'Denver',
        latitude: 39.74,
        longitude: -104.98,
        unit: 'fahrenheit',
      });
    }));
  });
});
