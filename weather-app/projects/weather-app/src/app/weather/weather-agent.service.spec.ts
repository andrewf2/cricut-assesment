import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WeatherAgentService } from './weather-agent.service';
import { API_ENDPOINTS } from './services.const';
import { AgentResponse } from './agent-response.model';

describe('WeatherAgentService', () => {
  let service: WeatherAgentService;
  let httpMock: HttpTestingController;

  const mockAgentResponse: AgentResponse = {
    message: 'Denver is currently 68°F with clear skies.',
    data: {
      city: { id: 1, name: 'Denver', country: 'US', latitude: 39.74, longitude: -104.98 },
      current: { temperature: 68, apparentTemperature: 65, humidity: 30, windSpeed: 10, weatherCode: 0 },
      forecast: [
        { date: '2024-01-01', temperatureMax: 72, temperatureMin: 50, weatherCode: 0, precipitationProbability: 5 },
      ],
    },
    toolResults: [
      { toolName: 'searchCities', result: {} },
      { toolName: 'getCurrentWeather', result: {} },
    ],
    usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(WeatherAgentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should POST query to agent endpoint', () => {
    service.query('What is the weather in Denver?').subscribe((response) => {
      expect(response.message).toBe(mockAgentResponse.message);
      expect(response.data.city?.name).toBe('Denver');
    });

    const req = httpMock.expectOne(API_ENDPOINTS.AGENT);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.query).toBe('What is the weather in Denver?');
    expect(req.request.body.context).toBeUndefined();
    req.flush(mockAgentResponse);
  });

  it('should include context when provided', () => {
    const context = { city: 'Denver', latitude: 39.74, longitude: -104.98, unit: 'fahrenheit' };

    service.query('current conditions', context).subscribe();

    const req = httpMock.expectOne(API_ENDPOINTS.AGENT);
    expect(req.request.body.query).toBe('current conditions');
    expect(req.request.body.context).toEqual(context);
    req.flush(mockAgentResponse);
  });

  it('should return tool results from response', () => {
    service.query('Denver weather').subscribe((response) => {
      expect(response.toolResults.length).toBe(2);
      expect(response.toolResults[0].toolName).toBe('searchCities');
    });

    const req = httpMock.expectOne(API_ENDPOINTS.AGENT);
    req.flush(mockAgentResponse);
  });

  it('should return usage info from response', () => {
    service.query('Denver weather').subscribe((response) => {
      expect(response.usage.totalTokens).toBe(150);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.AGENT);
    req.flush(mockAgentResponse);
  });
});
