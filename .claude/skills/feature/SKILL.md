# /feature <name>

Scaffold state management files for a new feature following the weather pattern.

## Arguments

- `<name>` — Feature name in **kebab-case** (e.g., `user-profile`)

## Instructions

1. Accept the feature name from the argument. Validate it is kebab-case.
2. Read the weather state files as reference patterns:
   - `weather-app/projects/weather-app/src/app/weather/state/weather-state.model.ts`
   - `weather-app/projects/weather-app/src/app/weather/state/weather-state.const.ts`
   - `weather-app/projects/weather-app/src/app/weather/state/weather.state.ts`
   - `weather-app/projects/weather-app/src/app/weather/state/weather.actions.ts`
   - `weather-app/projects/weather-app/src/app/weather/state/weather.reducer.ts`
   - `weather-app/projects/weather-app/src/app/weather/state/weather.selectors.ts`
   - `weather-app/projects/weather-app/src/app/weather/state/weather.store.ts`
   - `weather-app/projects/weather-app/src/app/weather/state/weather.effects.ts`
3. Create a new feature directory at `weather-app/projects/weather-app/src/app/<name>/`
4. Generate these 8 files inside `<name>/state/`:

| File | Purpose |
|------|---------|
| `<name>-state.model.ts` | State interface and TemperatureUnit-like types |
| `<name>-state.const.ts` | Constants (initial state values, config) |
| `<name>.state.ts` | Exports `initial<Name>State` and re-exports types |
| `<name>.actions.ts` | Actions using `createAction` from `lib` |
| `<name>.reducer.ts` | Reducer with `on()` handlers from `lib` |
| `<name>.selectors.ts` | Selector functions using `createSelector` from `lib` |
| `<name>.store.ts` | Store class extending `Store` from `lib` |
| `<name>.effects.ts` | Effects class extending `Effects` from `lib` |

5. Follow the flat directory structure — models, services, pipes, and consts live at the feature root, not in sub-folders.
6. Use placeholder types and actions — the developer will fill in domain-specific details.
7. Follow all AGENTS.md coding standards (readonly, explicit return types, `as const` objects, immutable state).
