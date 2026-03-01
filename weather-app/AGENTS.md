# Angular Coding Standards

Strict coding standards for this project. All contributors (human and AI) must follow these rules.

## Function Rules

### Maximum 20 lines per function

Every function and method must be **at most 20 lines** of actual code (excluding blank lines and the function signature). If a function exceeds this limit, extract logic into well-named private helper methods.

```ts
// BAD - too long, does too many things
onSubmit(form: FormData): void {
  // 40 lines of validation, API calls, state updates, error handling...
}

// GOOD - orchestrator delegates to focused helpers
onSubmit(form: FormData): void {
  const validated = this.validateForm(form);
  if (!validated) return;

  this.setLoadingState();
  this.api.submit(validated).subscribe({
    next: (response) => this.handleSuccess(response),
    error: (err) => this.handleError(err),
  });
}
```

### Single Responsibility

Each function does **one thing**. If you can describe a function with "and" (e.g., "validates the form **and** submits it **and** updates the UI"), it needs to be split.

Name functions by what they do:
- `buildAgentContext()` - builds context
- `handleAgentResponse()` - handles the response
- `dispatchWeatherFromAgent()` - dispatches weather data

Avoid generic names like `processData()`, `handleStuff()`, or `doWork()`.

## Template Rules

### Never bind function calls in templates

Function calls in templates re-execute on every change detection cycle. Always use **signals** or **pre-computed properties** instead.

```html
<!-- BAD - getFullName() runs on every change detection -->
<p>{{ getFullName() }}</p>
<div *ngIf="isVisible()">...</div>

<!-- GOOD - signals only update when their value changes -->
<p>{{ fullName() }}</p>
<div *ngIf="visible()">...</div>
```

The only exception is **event handlers**, which are fine since they only execute on user interaction:

```html
<!-- These are fine - event bindings, not expressions -->
<button (click)="onSubmit()">Submit</button>
<input (input)="onSearch($event)">
```

### Use signals for all reactive state

```ts
// BAD - mutable property, no change tracking
isLoading = false;

// GOOD - signal, reactive
readonly isLoading = signal(false);

// GOOD - computed from other signals
readonly hasData = computed(() => this.items().length > 0);

// GOOD - derived from store via select
readonly currentWeather = this.select(selectors.selectCurrentWeather);
```

### Use `@if` / `@for` control flow

Use Angular's built-in control flow, not structural directives:

```html
<!-- BAD -->
<div *ngIf="store.isLoading()">...</div>
<div *ngFor="let item of items()">...</div>

<!-- GOOD -->
@if (store.isLoading()) {
  <lib-loading-skeleton />
}

@for (item of items(); track item.id) {
  <item-card [item]="item" />
}
```

Always provide a `track` expression in `@for`.

## Component Rules

### Container / Presentational pattern

- **Container components** (in `containers/`): Inject services and the store, handle business logic, pass data down via inputs
- **Presentational components** (in `components/`): Receive data via `input()`, emit events via `output()`, contain zero business logic

```ts
// Container - has store, services, orchestrates
export class DashboardContainerComponent {
  readonly store = inject(WeatherStore);
  private readonly agentService = inject(WeatherAgentService);

  onAgentQuery(query: string): void { /* ... */ }
}

// Presentational - pure inputs/outputs
export class ForecastCardComponent {
  readonly forecast = input.required<DailyForecast>();
  readonly unit = input<string>('fahrenheit');
}
```

### Standalone components only

All components must be standalone. Do not use `NgModule`.

```ts
@Component({
  selector: 'app-feature',
  imports: [CommonModule, ChildComponent],  // imports, not declarations
  templateUrl: './feature.component.html',
})
export class FeatureComponent { }
```

### Use `inject()` over constructor injection

```ts
// BAD
constructor(private readonly store: WeatherStore) { }

// GOOD
private readonly store = inject(WeatherStore);
```

## State Management Rules

### Immutable state updates

Always return new objects from reducers. Never mutate state:

```ts
// BAD
on(addItem, (state, { payload }) => {
  state.items.push(payload);  // mutation!
  return state;
}),

// GOOD
on(addItem, (state, { payload }) => ({
  ...state,
  items: [...state.items, payload],
})),
```

### Action naming convention

Actions follow the pattern `[Feature] Verb Noun`:

```ts
'[Weather] Search Cities'
'[Weather] Search Cities Success'
'[Weather] Search Cities Failure'
'[Weather] Select City'
'[Weather] Toggle Temperature Unit'
```

### Side effects in Effects only

API calls, timers, navigation, and other side effects belong in `Effects` classes, not in components or reducers. Reducers must be pure functions.

## TypeScript Rules

### Use `as const` objects over enums

```ts
// BAD
enum LoadingState { Idle, Loading, Loaded, Error }

// GOOD
export const LOADING_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
} as const;
```

### Use `readonly` by default

Mark all properties and signals as `readonly` unless mutation is explicitly required:

```ts
readonly store = inject(WeatherStore);
readonly agentMessages = signal<AgentMessage[]>([]);
readonly isLoading = computed(() => this.status() === 'loading');
```

### Explicit return types on public methods

```ts
// BAD
onToggleUnit() { ... }

// GOOD
onToggleUnit(): void { ... }
```

### No `any` in public APIs

`any` is acceptable in internal implementation details (e.g., mapping untyped API responses) but never in public interfaces, inputs, outputs, or service method signatures.

## File Organization

### Naming conventions

| Type | Pattern | Example |
|------|---------|---------|
| Component | `feature-name.component.ts` | `current-weather.component.ts` |
| Service | `feature-name.service.ts` | `weather-api.service.ts` |
| Model | `feature-name.model.ts` | `city.model.ts` |
| Store | `feature-name.store.ts` | `weather.store.ts` |
| Actions | `feature-name.actions.ts` | `weather.actions.ts` |
| Reducer | `feature-name.reducer.ts` | `weather.reducer.ts` |
| Selectors | `feature-name.selectors.ts` | `weather.selectors.ts` |
| Effects | `feature-name.effects.ts` | `weather.effects.ts` |
| Constants | `feature-name.const.ts` | `weather-state.const.ts` |

### Feature folder structure

```
feature/
  *.model.ts       # Interfaces and types
  *.service.ts     # API services and data access
  *.pipe.ts        # Pipes
  *.const.ts       # Constants
  state/           # Store, actions, reducer, selectors, effects
  containers/      # Smart components (inject store/services)
  components/      # Presentational components (inputs/outputs only)
```

## Code Review Checklist

Before submitting code, verify:

- [ ] No function exceeds 20 lines
- [ ] Each function has a single responsibility
- [ ] No function calls bound in templates (signals only)
- [ ] All state is managed through signals or the store
- [ ] Container/presentational separation is maintained
- [ ] Actions follow `[Feature] Verb Noun` convention
- [ ] State updates are immutable
- [ ] Side effects are in Effects classes, not components
- [ ] `readonly` is used on all properties that don't need mutation
- [ ] Public methods have explicit return types
- [ ] Components are standalone with `imports` (no NgModule)
