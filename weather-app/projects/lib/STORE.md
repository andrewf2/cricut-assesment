# Store Framework

A lightweight, NgRx-inspired state management framework built for Angular. It provides the core building blocks (Store, Actions, Reducers, Selectors, Effects) without the boilerplate of full NgRx, and integrates natively with Angular signals.

## Overview

```
lib/src/lib/store/
  action.ts             # createAction factory
  action.model.ts       # Action, ActionCreator interfaces
  store.ts              # Store<S, A> base class
  create-reducer.ts     # createReducer + on
  create-selector.ts    # createSelector with memoization
  effect.ts             # Effects base class + ofType operator
  operators/
    with-loading-state.ts    # Loading/success/error wrapper
    with-retry-backoff.ts    # Exponential retry operator
```

## Core Concepts

### Actions

Actions are plain objects with a `type` string. Use `createAction` to define typed action creators:

```ts
import { createAction } from 'lib';

// Action with no payload
const clearSearch = createAction('[Feature] Clear Search');

// Action with a typed payload
const searchCities = createAction<'[Feature] Search', string>('[Feature] Search');
const loadSuccess = createAction<'[Feature] Load Success', { data: Item[] }>('[Feature] Load Success');

// Usage
store.dispatch(clearSearch());
store.dispatch(searchCities('New York'));
store.dispatch(loadSuccess({ data: items }));
```

Define a union type of all actions for your feature:

```ts
export type FeatureAction =
  | ReturnType<typeof searchCities>
  | ReturnType<typeof loadSuccess>
  | ReturnType<typeof clearSearch>;
```

### Reducer

Use `createReducer` and `on` to build a reducer from action handlers:

```ts
import { createReducer, on, LOADING_STATE } from 'lib';

export const featureReducer = createReducer<FeatureState>(
  initialState,

  on(searchCities, (state, { payload }) => ({
    ...state,
    query: payload,
    loading: LOADING_STATE.LOADING,
  })),

  on(loadSuccess, (state, { payload }) => ({
    ...state,
    data: payload.data,
    loading: LOADING_STATE.LOADED,
  })),

  on(clearSearch, (state) => ({
    ...state,
    query: '',
    data: [],
    loading: LOADING_STATE.IDLE,
  })),
);
```

Each `on()` handler receives the current state and the typed action, and returns a new state. Handlers are matched by action type via an internal `Map` for O(1) lookup.

### Store

`Store<S, A>` is the central state container. It uses a `BehaviorSubject` internally with `scan` to apply the reducer to each dispatched action.

```ts
import { Injectable } from '@angular/core';
import { Store } from 'lib';

@Injectable({ providedIn: 'root' })
export class FeatureStore extends Store<FeatureState, FeatureAction> {
  // Expose state slices as Angular signals
  readonly query = this.select(selectQuery);
  readonly data = this.select(selectData);
  readonly isLoading = this.select(selectIsLoading);

  constructor() {
    super(initialState, featureReducer);
  }
}
```

**Key methods:**

| Method | Description |
|--------|-------------|
| `dispatch(action)` | Send an action through the reducer |
| `select(selector)` | Create an Angular `Signal<R>` from a selector function |
| `getState()` | Synchronously read the current state |
| `state$` | `Observable<S>` of all state changes |
| `actions$` | `Observable<A>` of all dispatched actions |

`select()` returns an Angular `Signal` backed by `toSignal()`. This means state slices are reactive, work with Angular's change detection, and can be used directly in templates:

```html
@if (store.isLoading()) {
  <lib-loading-skeleton />
} @else {
  <div>{{ store.data() }}</div>
}
```

### Selectors

Use `createSelector` for memoized derived state. It supports 1-3 input selectors plus a projector:

```ts
import { createSelector, LOADING_STATE } from 'lib';

// Simple selector (no memoization needed)
const selectQuery = (state: FeatureState) => state.query;
const selectLoading = (state: FeatureState) => state.loading;
const selectData = (state: FeatureState) => state.data;

// Memoized composed selector
const selectIsLoading = createSelector(
  selectLoading,
  (loading) => loading === LOADING_STATE.LOADING,
);

// Multi-input memoized selector
const selectHasData = createSelector(
  selectData,
  selectLoading,
  (data, loading) => data.length > 0 && loading === LOADING_STATE.LOADED,
);
```

Memoization uses reference equality on inputs -- the projector only re-runs when an input selector returns a new reference.

### Effects

Effects handle side effects (API calls, timers, etc.) in response to actions. Extend the `Effects` base class and register effects in the constructor:

```ts
import { Injectable, inject } from '@angular/core';
import { debounceTime, switchMap, catchError, of, map } from 'rxjs';
import { Effects, ofType, withRetryBackoff } from 'lib';

@Injectable()
export class FeatureEffects extends Effects<FeatureAction> {
  private readonly api = inject(ApiService);

  constructor(store: FeatureStore) {
    super(store);

    // Search with debounce
    this.createEffect(
      this.store.actions$.pipe(
        ofType(searchCities.type),
        debounceTime(300),
        switchMap((action) =>
          this.api.search(action.payload).pipe(
            map((results) => loadSuccess({ data: results })),
            catchError((err) => of(loadFailure(err.message))),
          ),
        ),
      ),
    );
  }
}
```

**Effect registration methods:**

| Method | Description |
|--------|-------------|
| `createEffect(effect$)` | Subscribe to an Observable that emits actions; each emission is dispatched |
| `createEffectNoDispatch(effect$)` | Subscribe for side effects only (logging, navigation, etc.) |

Both are automatically cleaned up via `takeUntilDestroyed`.

**`ofType` operator:**

Filters the action stream to specific action types with proper type narrowing:

```ts
this.store.actions$.pipe(
  ofType<FeatureAction, typeof searchCities.type>(searchCities.type),
  // action is now typed as { type: '[Feature] Search'; payload: string }
)
```

### Effects Registration

Effects must be provided and eagerly initialized in your app config:

```ts
import { provideEnvironmentInitializer, inject } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    FeatureEffects,
    provideEnvironmentInitializer(() => inject(FeatureEffects)),
  ],
};
```

## RxJS Operators

### `withLoadingState<T>()`

Wraps an Observable into a loading/success/error state machine:

```ts
import { withLoadingState } from 'lib';

this.api.fetchData().pipe(
  withLoadingState(),
).subscribe((result) => {
  // result: { loading: boolean; data: T | null; error: string | null }
  if (result.loading) { /* show spinner */ }
  if (result.data) { /* render data */ }
  if (result.error) { /* show error */ }
});
```

Emits `{ loading: true, data: null, error: null }` immediately via `startWith`, then `{ loading: false, data: T, error: null }` on success, or `{ loading: false, data: null, error: string }` on error.

### `withRetryBackoff(config?)`

Retries failed Observables with exponential backoff:

```ts
import { withRetryBackoff } from 'lib';

this.api.fetchData().pipe(
  withRetryBackoff({ maxRetries: 3, initialDelay: 1000, maxDelay: 10000 }),
)
```

| Option | Default | Description |
|--------|---------|-------------|
| `maxRetries` | 3 | Maximum retry attempts |
| `initialDelay` | 1000 | Initial delay in ms |
| `maxDelay` | 10000 | Maximum delay cap in ms |

Delay formula: `min(initialDelay * 2^(attempt-1), maxDelay)`

## Types

### `LoadingState`

```ts
type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';
```

Use the `LOADING_STATE` const object for type-safe comparisons:

```ts
import { LOADING_STATE } from 'lib';

LOADING_STATE.IDLE     // 'idle'
LOADING_STATE.LOADING  // 'loading'
LOADING_STATE.LOADED   // 'loaded'
LOADING_STATE.ERROR    // 'error'
```

### `LoadingResult<T>`

```ts
interface LoadingResult<T> {
  loading: boolean;
  data: T | null;
  error: string | null;
}
```

## Full Example

Putting it all together for a feature:

```ts
// feature.actions.ts
export const load = createAction<'[Feature] Load', string>('[Feature] Load');
export const loadSuccess = createAction<'[Feature] Load Success', Item[]>('[Feature] Load Success');
export const loadFailure = createAction<'[Feature] Load Failure', string>('[Feature] Load Failure');

// feature.reducer.ts
export const featureReducer = createReducer<FeatureState>(
  { items: [], loading: LOADING_STATE.IDLE, error: null },
  on(load, (state) => ({ ...state, loading: LOADING_STATE.LOADING, error: null })),
  on(loadSuccess, (state, { payload }) => ({ ...state, items: payload, loading: LOADING_STATE.LOADED })),
  on(loadFailure, (state, { payload }) => ({ ...state, loading: LOADING_STATE.ERROR, error: payload })),
);

// feature.store.ts
@Injectable({ providedIn: 'root' })
export class FeatureStore extends Store<FeatureState, FeatureAction> {
  readonly items = this.select((s) => s.items);
  readonly isLoading = this.select(selectIsLoading);
  constructor() { super(initialState, featureReducer); }
}

// feature.effects.ts
@Injectable()
export class FeatureEffects extends Effects<FeatureAction> {
  private readonly api = inject(ApiService);
  constructor(store: FeatureStore) {
    super(store);
    this.createEffect(
      this.store.actions$.pipe(
        ofType(load.type),
        switchMap(({ payload }) =>
          this.api.fetch(payload).pipe(
            withRetryBackoff({ maxRetries: 2, initialDelay: 1000 }),
            map((data) => loadSuccess(data)),
            catchError((err) => of(loadFailure(err.message))),
          ),
        ),
      ),
    );
  }
}

// Template
@if (store.isLoading()) {
  <spinner />
} @else {
  @for (item of store.items(); track item.id) {
    <item-card [item]="item" />
  }
}
```
