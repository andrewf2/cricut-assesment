import { Injectable, inject } from '@angular/core';
import { switchMap, catchError, of, map } from 'rxjs';
import { Effects, ofType, DEFAULT_ERROR_MESSAGE } from 'lib';
import { WeatherAgentService } from '../weather-agent.service';
import {
  WeatherAction,
  agentQuery, agentQuerySuccess, agentQueryFailure,
} from './weather.actions';
import { WeatherStore } from './weather.store';

@Injectable()
export class WeatherEffects extends Effects<WeatherAction> {
  private readonly agentService = inject(WeatherAgentService);

  constructor(store: WeatherStore) {
    super(store);

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
