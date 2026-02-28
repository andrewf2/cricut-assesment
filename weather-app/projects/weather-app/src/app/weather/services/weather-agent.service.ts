import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AgentResponse } from './agent-response.model';
import { API_ENDPOINTS } from './services.const';

@Injectable({ providedIn: 'root' })
export class WeatherAgentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_ENDPOINTS.AGENT;

  query(query: string, context?: { city?: string; latitude?: number; longitude?: number; unit?: string }): Observable<AgentResponse> {
    return this.http.post<AgentResponse>(this.baseUrl, { query, context });
  }
}
