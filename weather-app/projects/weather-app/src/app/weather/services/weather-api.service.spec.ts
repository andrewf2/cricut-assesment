import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WeatherApiService } from './weather-api.service';

describe('WeatherApiService', () => {
  let service: WeatherApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(WeatherApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should map API response to CurrentWeather and DailyForecast', () => {
    const mockResponse = {
      current: {
        temperature_2m: 72,
        apparent_temperature: 70,
        relative_humidity_2m: 30,
        wind_speed_10m: 10,
        weather_code: 0,
      },
      daily: {
        time: ['2024-01-01', '2024-01-02'],
        temperature_2m_max: [75, 78],
        temperature_2m_min: [55, 58],
        weather_code: [0, 1],
        precipitation_probability_max: [10, 20],
      },
    };

    service.getWeather(39.74, -104.98).subscribe((result) => {
      expect(result.current.temperature).toBe(72);
      expect(result.current.humidity).toBe(30);
      expect(result.forecast.length).toBe(2);
      expect(result.forecast[0].date).toBe('2024-01-01');
      expect(result.forecast[0].temperatureMax).toBe(75);
    });

    const req = httpMock.expectOne((r) => r.url.includes('api.open-meteo.com'));
    expect(req.request.params.get('latitude')).toBe('39.74');
    req.flush(mockResponse);
  });
});
