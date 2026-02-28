import { Injectable, inject } from '@angular/core';
import { debounceTime, switchMap, catchError, of, filter, map } from 'rxjs';
import { Effects, ofType, withRetryBackoff } from 'lib';
import { GeocodingApiService } from '../services/geocoding-api.service';
import { WeatherApiService } from '../services/weather-api.service';
import { WeatherAction, searchCities, searchCitiesSuccess, searchCitiesFailure, selectCity, loadWeatherSuccess, loadWeatherFailure } from './weather.actions';
import { WeatherStore } from './weather.store';
import { SEARCH_DEBOUNCE_MS, MIN_SEARCH_LENGTH, WEATHER_RETRY_CONFIG, SEARCH_FAILED_MESSAGE, WEATHER_LOAD_FAILED_MESSAGE } from './weather-state.const';

@Injectable()
export class WeatherEffects extends Effects<WeatherAction> {
  private readonly geocodingApi = inject(GeocodingApiService);
  private readonly weatherApi = inject(WeatherApiService);

  constructor(store: WeatherStore) {
    super(store);

    this.createEffect(
      this.store.actions$.pipe(
        ofType<WeatherAction, typeof searchCities.type>(searchCities.type),
        debounceTime(SEARCH_DEBOUNCE_MS),
        filter((action) => action.payload.trim().length >= MIN_SEARCH_LENGTH),
        switchMap((action) =>
          this.geocodingApi.search(action.payload).pipe(
            map((cities) => searchCitiesSuccess(cities)),
            catchError((err) => of(searchCitiesFailure(err?.message ?? SEARCH_FAILED_MESSAGE))),
          ),
        ),
      ),
    );

    this.createEffect(
      this.store.actions$.pipe(
        ofType<WeatherAction, typeof selectCity.type>(selectCity.type),
        switchMap((action) =>
          this.weatherApi.getWeather(action.payload.latitude, action.payload.longitude).pipe(
            withRetryBackoff(WEATHER_RETRY_CONFIG),
            map((data) => loadWeatherSuccess(data)),
            catchError((err) => of(loadWeatherFailure(err?.message ?? WEATHER_LOAD_FAILED_MESSAGE))),
          ),
        ),
      ),
    );
  }
}
