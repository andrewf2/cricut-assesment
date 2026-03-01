import { ApplicationConfig, provideZoneChangeDetection, inject, provideEnvironmentInitializer } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { WeatherEffects } from './weather/state/weather.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideHttpClient(),
    WeatherEffects,
    provideEnvironmentInitializer(() => inject(WeatherEffects)),
  ],
};
