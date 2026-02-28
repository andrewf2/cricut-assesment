import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GeocodingApiService } from './geocoding-api.service';

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

  it('should map API response to City array', () => {
    const mockResponse = {
      results: [
        { id: 1, name: 'Denver', country: 'US', admin1: 'Colorado', latitude: 39.74, longitude: -104.98 },
      ],
    };

    service.search('Denver').subscribe((cities) => {
      expect(cities.length).toBe(1);
      expect(cities[0].name).toBe('Denver');
      expect(cities[0].country).toBe('US');
    });

    const req = httpMock.expectOne((r) => r.url.includes('geocoding-api.open-meteo.com'));
    expect(req.request.params.get('name')).toBe('Denver');
    req.flush(mockResponse);
  });

  it('should return empty array when no results', () => {
    service.search('xyznonexistent').subscribe((cities) => {
      expect(cities).toEqual([]);
    });

    const req = httpMock.expectOne((r) => r.url.includes('geocoding-api.open-meteo.com'));
    req.flush({});
  });

  it('should cache repeated queries', () => {
    const mockResponse = { results: [{ id: 1, name: 'Denver', country: 'US', latitude: 39.74, longitude: -104.98 }] };

    service.search('Denver').subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('geocoding-api.open-meteo.com'));
    req.flush(mockResponse);

    // Second call with same query should use cache (no new HTTP request)
    service.search('Denver').subscribe((cities) => {
      expect(cities.length).toBe(1);
    });

    httpMock.expectNone((r) => r.url.includes('geocoding-api.open-meteo.com'));
  });
});
