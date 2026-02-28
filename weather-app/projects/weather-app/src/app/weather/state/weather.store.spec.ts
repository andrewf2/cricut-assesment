import { TestBed } from '@angular/core/testing';
import { WeatherStore } from './weather.store';
import * as actions from './weather.actions';

describe('WeatherStore', () => {
  let store: WeatherStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WeatherStore],
    });
    store = TestBed.inject(WeatherStore);
  });

  it('should have initial state', () => {
    expect(store.getState().searchQuery).toBe('');
    expect(store.getState().selectedCity).toBeNull();
    expect(store.getState().temperatureUnit).toBe('fahrenheit');
  });

  it('should update state on dispatch', () => {
    store.dispatch(actions.searchCities('Denver'));
    expect(store.getState().searchQuery).toBe('Denver');
    expect(store.getState().searchLoading).toBe('loading');
  });

  it('should expose signals via select', () => {
    expect(store.searchQuery()).toBe('');
    store.dispatch(actions.searchCities('Denver'));
    expect(store.searchQuery()).toBe('Denver');
  });

  it('should toggle temperature unit', () => {
    expect(store.temperatureUnit()).toBe('fahrenheit');
    store.dispatch(actions.toggleTemperatureUnit());
    expect(store.temperatureUnit()).toBe('celsius');
  });
});
