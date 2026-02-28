import { ApplicationConfig, provideZoneChangeDetection, inject, provideEnvironmentInitializer } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { WeatherEffects } from './weather/state/weather.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    WeatherEffects,
    provideEnvironmentInitializer(() => inject(WeatherEffects)),
  ],
};
