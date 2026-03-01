import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { WeatherDashboardContainerComponent } from './weather-dashboard-container.component';
import { WeatherStore } from '../../state/weather.store';
import * as actions from '../../state/weather.actions';

describe('WeatherDashboardContainerComponent', () => {
  let component: WeatherDashboardContainerComponent;
  let store: WeatherStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, WeatherDashboardContainerComponent],
      providers: [
        provideAnimationsAsync(),
        WeatherStore,
      ],
    });

    store = TestBed.inject(WeatherStore);
    const fixture = TestBed.createComponent(WeatherDashboardContainerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch toggleTemperatureUnit on onToggleUnit', () => {
    spyOn(store, 'dispatch');
    component.onToggleUnit();
    expect(store.dispatch).toHaveBeenCalledWith(actions.toggleTemperatureUnit());
  });

  it('should dispatch agentQuery on onAgentQuery', () => {
    spyOn(store, 'dispatch');
    component.onAgentQuery('What is the weather in Denver?');
    expect(store.dispatch).toHaveBeenCalledWith(actions.agentQuery('What is the weather in Denver?'));
  });
});
