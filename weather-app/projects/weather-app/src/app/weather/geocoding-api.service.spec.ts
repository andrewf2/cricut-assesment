import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GeocodingApiService } from './geocoding-api.service';
import { API_ENDPOINTS } from './services.const';

describe('GeocodingApiService', () => {
  let service: GeocodingApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(GeocodingApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should POST to backend and map response to City array', () => {
    const mockResponse = {
      cities: [
        { id: 1, name: 'Denver', country: 'US', admin1: 'Colorado', latitude: 39.74, longitude: -104.98 },
      ],
    };

    service.search('Denver').subscribe((cities) => {
      expect(cities.length).toBe(1);
      expect(cities[0].name).toBe('Denver');
      expect(cities[0].country).toBe('US');
      expect(cities[0].latitude).toBe(39.74);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.SEARCH);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ query: 'Denver' });
    req.flush(mockResponse);
  });

  it('should map admin1 null to undefined', () => {
    const mockResponse = {
      cities: [
        { id: 1, name: 'Denver', country: 'US', admin1: null, latitude: 39.74, longitude: -104.98 },
      ],
    };

    service.search('Denver').subscribe((cities) => {
      expect(cities[0].admin1).toBeUndefined();
    });

    const req = httpMock.expectOne(API_ENDPOINTS.SEARCH);
    req.flush(mockResponse);
  });

  it('should cache repeated queries', () => {
    const mockResponse = {
      cities: [{ id: 1, name: 'Denver', country: 'US', admin1: null, latitude: 39.74, longitude: -104.98 }],
    };

    service.search('Denver').subscribe();
    const req = httpMock.expectOne(API_ENDPOINTS.SEARCH);
    req.flush(mockResponse);

    // Second call with same query should use cache (no new HTTP request)
    service.search('Denver').subscribe((cities) => {
      expect(cities.length).toBe(1);
    });

    httpMock.expectNone(API_ENDPOINTS.SEARCH);
  });

  it('should cache case-insensitively', () => {
    const mockResponse = {
      cities: [{ id: 1, name: 'Denver', country: 'US', admin1: null, latitude: 39.74, longitude: -104.98 }],
    };

    service.search('Denver').subscribe();
    httpMock.expectOne(API_ENDPOINTS.SEARCH).flush(mockResponse);

    // Same query different case should hit cache
    service.search('denver').subscribe((cities) => {
      expect(cities.length).toBe(1);
    });

    httpMock.expectNone(API_ENDPOINTS.SEARCH);
  });
});
