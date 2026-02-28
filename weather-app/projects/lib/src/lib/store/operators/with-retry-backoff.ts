import { Observable, retry, timer } from 'rxjs';
import { RetryBackoffConfig } from './retry-backoff-config.model';
import { DEFAULT_MAX_RETRIES, DEFAULT_INITIAL_DELAY_MS, DEFAULT_MAX_DELAY_MS } from './operators.const';

export type { RetryBackoffConfig };

export function withRetryBackoff<T>(config: RetryBackoffConfig = {}) {
  const { maxRetries = DEFAULT_MAX_RETRIES, initialDelay = DEFAULT_INITIAL_DELAY_MS, maxDelay = DEFAULT_MAX_DELAY_MS } = config;

  return (source: Observable<T>): Observable<T> =>
    source.pipe(
      retry({
        count: maxRetries,
        delay: (error, retryCount) => {
          const delay = Math.min(initialDelay * Math.pow(2, retryCount - 1), maxDelay);
          return timer(delay);
        },
      }),
    );
}
