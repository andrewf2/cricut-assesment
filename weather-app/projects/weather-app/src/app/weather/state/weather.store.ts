import { Injectable } from '@angular/core';
import { Store } from 'lib';
import { WeatherAction } from './weather.actions';
import { weatherReducer } from './weather.reducer';
import { WeatherState, initialWeatherState } from './weather.state';
import * as selectors from './weather.selectors';

@Injectable({ providedIn: 'root' })
export class WeatherStore extends Store<WeatherState, WeatherAction> {
  readonly searchQuery = this.select(selectors.selectSearchQuery);
  readonly searchResults = this.select(selectors.selectSearchResults);
  readonly searchLoading = this.select(selectors.selectSearchLoading);
  readonly searchError = this.select(selectors.selectSearchError);
  readonly isSearching = this.select(selectors.selectIsSearching);
  readonly hasSearchResults = this.select(selectors.selectHasSearchResults);

  readonly selectedCity = this.select(selectors.selectSelectedCity);

  readonly currentWeather = this.select(selectors.selectCurrentWeather);
  readonly forecast = this.select(selectors.selectForecast);
  readonly weatherLoading = this.select(selectors.selectWeatherLoading);
  readonly weatherError = this.select(selectors.selectWeatherError);
  readonly isWeatherLoading = this.select(selectors.selectIsWeatherLoading);
  readonly hasWeatherData = this.select(selectors.selectHasWeatherData);

  readonly comparisonCity = this.select(selectors.selectComparisonCity);
  readonly comparisonWeather = this.select(selectors.selectComparisonWeather);

  readonly temperatureUnit = this.select(selectors.selectTemperatureUnit);

  readonly agentMessages = this.select(selectors.selectAgentMessages);
  readonly agentLoading = this.select(selectors.selectAgentLoading);

  constructor() {
    super(initialWeatherState, weatherReducer);
  }
}
