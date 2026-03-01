import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { City } from './city.model';
import { API_ENDPOINTS } from './services.const';
import { BackendSearchResponse } from './backend-search-response.model';

@Injectable({ providedIn: 'root' })
export class GeocodingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_ENDPOINTS.SEARCH;
  private readonly cache = new Map<string, Observable<City[]>>();

  search(query: string): Observable<City[]> {
    const key = query.trim().toLowerCase();
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const result$ = this.http
      .post<BackendSearchResponse>(this.baseUrl, { query })
      .pipe(
        map((response) =>
          response.cities.map((r) => ({
            id: r.id,
            name: r.name,
            country: r.country,
            admin1: r.admin1 ?? undefined,
            latitude: r.latitude,
            longitude: r.longitude,
          })),
        ),
        shareReplay(1),
      );

    this.cache.set(key, result$);
    return result$;
  }
}
