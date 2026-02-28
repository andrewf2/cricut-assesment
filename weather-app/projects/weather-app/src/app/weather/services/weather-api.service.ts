import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CurrentWeather, DailyForecast } from '../models/weather.model';
import { API_ENDPOINTS } from './services.const';
import { BackendWeatherResponse } from './backend-weather-response.model';

@Injectable({ providedIn: 'root' })
export class WeatherApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_ENDPOINTS.CURRENT;

  getWeather(latitude: number, longitude: number): Observable<{ current: CurrentWeather; forecast: DailyForecast[] }> {
    return this.http
      .post<BackendWeatherResponse>(this.baseUrl, { latitude, longitude })
      .pipe(
        map((response) => ({
          current: {
            temperature: response.current.temperature,
            apparentTemperature: response.current.apparentTemperature,
            humidity: response.current.humidity,
            windSpeed: response.current.windSpeed,
            weatherCode: response.current.weatherCode,
          },
          forecast: response.forecast,
        })),
      );
  }
}
