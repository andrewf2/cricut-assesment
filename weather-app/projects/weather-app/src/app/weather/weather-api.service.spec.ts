import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WeatherApiService } from './weather-api.service';
import { API_ENDPOINTS } from './services.const';

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

  it('should POST to backend and map response to CurrentWeather and DailyForecast', () => {
    const mockResponse = {
      current: {
        temperature: 72,
        apparentTemperature: 70,
        humidity: 30,
        windSpeed: 10,
        weatherCode: 0,
        unit: 'fahrenheit',
      },
      forecast: [
        { date: '2024-01-01', temperatureMax: 75, temperatureMin: 55, weatherCode: 0, precipitationProbability: 10 },
        { date: '2024-01-02', temperatureMax: 78, temperatureMin: 58, weatherCode: 1, precipitationProbability: 20 },
      ],
    };

    service.getWeather(39.74, -104.98).subscribe((result) => {
      expect(result.current.temperature).toBe(72);
      expect(result.current.apparentTemperature).toBe(70);
      expect(result.current.humidity).toBe(30);
      expect(result.current.windSpeed).toBe(10);
      expect(result.current.weatherCode).toBe(0);
      expect(result.forecast.length).toBe(2);
      expect(result.forecast[0].date).toBe('2024-01-01');
      expect(result.forecast[0].temperatureMax).toBe(75);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.CURRENT);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ latitude: 39.74, longitude: -104.98 });
    req.flush(mockResponse);
  });

  it('should pass through forecast array directly', () => {
    const mockResponse = {
      current: {
        temperature: 50,
        apparentTemperature: 48,
        humidity: 60,
        windSpeed: 5,
        weatherCode: 3,
        unit: 'fahrenheit',
      },
      forecast: [],
    };

    service.getWeather(0, 0).subscribe((result) => {
      expect(result.forecast).toEqual([]);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.CURRENT);
    req.flush(mockResponse);
  });
});
