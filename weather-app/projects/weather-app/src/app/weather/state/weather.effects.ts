import { Injectable, inject } from '@angular/core';
import { debounceTime, switchMap, catchError, of, filter, map } from 'rxjs';
import { Effects, ofType, withRetryBackoff, DEFAULT_ERROR_MESSAGE } from 'lib';
import { GeocodingApiService } from '../geocoding-api.service';
import { WeatherApiService } from '../weather-api.service';
import { WeatherAgentService } from '../weather-agent.service';
import {
  WeatherAction,
  searchCities, searchCitiesSuccess, searchCitiesFailure,
  selectCity, loadWeatherSuccess, loadWeatherFailure,
  agentQuery, agentQuerySuccess, agentQueryFailure,
} from './weather.actions';
import { WeatherStore } from './weather.store';
import { SEARCH_DEBOUNCE_MS, MIN_SEARCH_LENGTH, WEATHER_RETRY_CONFIG, SEARCH_FAILED_MESSAGE, WEATHER_LOAD_FAILED_MESSAGE } from './weather-state.const';

@Injectable()
export class WeatherEffects extends Effects<WeatherAction> {
  private readonly geocodingApi = inject(GeocodingApiService);
  private readonly weatherApi = inject(WeatherApiService);
  private readonly agentService = inject(WeatherAgentService);

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

    this.createEffect(
      this.store.actions$.pipe(
        ofType<WeatherAction, typeof agentQuery.type>(agentQuery.type),
        switchMap((action) =>
          this.agentService.query(action.payload, this.buildAgentContext()).pipe(
            map((response) => agentQuerySuccess(response)),
            catchError((err) => of(agentQueryFailure(err?.message ?? DEFAULT_ERROR_MESSAGE))),
          ),
        ),
      ),
    );
  }

  private buildAgentContext(): { city: string; latitude: number; longitude: number; unit: string } | undefined {
    const currentCity = (this.store as WeatherStore).selectedCity();
    if (!currentCity) return undefined;
    return {
      city: currentCity.name,
      latitude: currentCity.latitude,
      longitude: currentCity.longitude,
      unit: (this.store as WeatherStore).temperatureUnit(),
    };
  }
}
