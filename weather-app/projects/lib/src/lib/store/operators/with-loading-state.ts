import { Observable, of, startWith, catchError, map } from 'rxjs';
import { LoadingResult } from './loading-result.model';
import { DEFAULT_ERROR_MESSAGE } from './operators.const';

export type { LoadingResult };

export function withLoadingState<T>() {
  return (source: Observable<T>): Observable<LoadingResult<T>> =>
    source.pipe(
      map((data) => ({ loading: false, data, error: null } as LoadingResult<T>)),
      startWith({ loading: true, data: null, error: null } as LoadingResult<T>),
      catchError((err) =>
        of({ loading: false, data: null, error: err?.message ?? DEFAULT_ERROR_MESSAGE } as LoadingResult<T>),
      ),
    );
}
