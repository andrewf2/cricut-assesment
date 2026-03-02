# Project Instructions

## Coding Standards

Always read and follow `weather-app/AGENTS.md` before writing or reviewing code. It contains mandatory rules for:
- Function length limits (20 lines max)
- Template rules (no function bindings, use signals)
- Component patterns (container/presentational, standalone)
- State management (immutable updates, action naming, effects)
- TypeScript rules (readonly, explicit return types, no `any` in public APIs)
- File naming and flat feature folder structure

## Project Structure

- `weather-app/` — Angular 21 monorepo (app + shared library)
- `weather-app/server/` — Express backend with Gemini AI agent
- `weather-app/projects/lib/` — Shared Angular library (store framework, UI components)
- `weather-app/projects/weather-app/` — Main Angular application

## Build & Test

```bash
# Build (lib must build first)
cd weather-app && npx ng build lib && npx ng build weather-app

# Test Angular app
npx ng test weather-app --watch=false --browsers=ChromeHeadless

# Test server
cd weather-app/server && npm test

# Run server in mock mode (no API key needed)
cd weather-app/server && npm run dev:mock
```

## Key Conventions

- Features use a **flat directory structure** — models, services, pipes, and consts live at the feature root (not in sub-folders). Only `state/`, `containers/`, and `components/` remain as folders.
- The shared library (`lib`) must be built before the app.
- Server supports `MOCK_MODE=true` for running without a Gemini API key.
- **No magic strings** — all string literals used as keys, tool names, or identifiers must be extracted to named constants in the appropriate `*.const.ts` file. Use `as const` objects for related groups of constants.
