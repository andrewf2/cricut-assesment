export interface BackendSearchResponse {
  cities: Array<{
    id: number;
    name: string;
    country: string;
    admin1: string | null;
    latitude: number;
    longitude: number;
  }>;
}
