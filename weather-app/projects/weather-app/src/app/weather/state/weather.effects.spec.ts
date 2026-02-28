import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { WeatherEffects } from './weather.effects';
import { WeatherStore } from './weather.store';
import { GeocodingApiService } from '../services/geocoding-api.service';
import { WeatherApiService } from '../services/weather-api.service';
import * as actions from './weather.actions';
import { City } from '../models/city.model';

describe('WeatherEffects', () => {
  let store: WeatherStore;
  let geocodingApi: jasmine.SpyObj<GeocodingApiService>;
  let weatherApi: jasmine.SpyObj<WeatherApiService>;

  const mockCity: City = { id: 1, name: 'Denver', country: 'US', latitude: 39.74, longitude: -104.98 };

  beforeEach(() => {
    geocodingApi = jasmine.createSpyObj('GeocodingApiService', ['search']);
    weatherApi = jasmine.createSpyObj('WeatherApiService', ['getWeather']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WeatherStore,
        WeatherEffects,
        { provide: GeocodingApiService, useValue: geocodingApi },
        { provide: WeatherApiService, useValue: weatherApi },
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
});
