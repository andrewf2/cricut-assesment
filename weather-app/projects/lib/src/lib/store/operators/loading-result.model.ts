export interface LoadingResult<T> {
  loading: boolean;
  data: T | null;
  error: string | null;
}
