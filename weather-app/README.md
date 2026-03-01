# Weather App

An Angular 21 weather application powered by a Google Gemini AI agent. Users can ask natural-language weather questions through a chat interface, and the AI agent calls weather tools (city search, current conditions, 7-day forecast, city comparison) to return structured data that populates the UI.

## Architecture

```
weather-app/
  projects/
    lib/                  # Shared Angular library
      src/lib/
        store/            # Custom NgRx-like state management framework
        types/            # LoadingState type + const
        pipes/            # TemperaturePipe (C/F conversion)
        ui/               # Reusable components (AgentChat, ErrorBanner, LoadingSkeleton, SearchInput)
    weather-app/          # Angular application
      src/app/
        weather/
          *.model.ts      # City, CurrentWeather, DailyForecast, agent response models
          *.service.ts    # API services (geocoding, weather, agent)
          *.pipe.ts       # WeatherIconPipe
          *.const.ts      # Constants
          state/          # WeatherStore, reducer, actions, selectors, effects
          containers/     # Smart components (dashboard, search)
          components/     # Presentational components (current-weather, forecast-list, etc.)
  server/                 # Express.js backend with Gemini AI agent
    src/
      server.ts           # Express app, routes
      weather-tools.ts    # AI SDK tool definitions (Open-Meteo API wrappers)
```

### Data Flow

1. User types a query into the `AgentChatComponent`
2. `WeatherDashboardContainerComponent` sends the query to `WeatherAgentService`
3. The service POSTs to `/api/weather/agent` on the Express backend
4. The backend uses Gemini with tool calling to search cities, fetch weather, and return structured JSON
5. The container dispatches `agentLoadWeather` to the store, updating the dashboard UI

### Shared Library (`lib`)

The shared library provides a custom store framework, UI components, and utilities. It is built separately via `ng-packagr` and consumed by the weather app through a TypeScript path alias.

See [Store Framework README](projects/lib/STORE.md) for detailed documentation.

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Google AI API Key** (Gemini) for the agent endpoint

## Environment Variables

The backend server requires a Google AI API key to power the Gemini agent:

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes (either this or the one below) | Google AI Studio API key for Gemini |
| `GOOGLE_API_KEY` | Yes (either this or the one above) | Alternative env var name for the same key |
| `PORT` | No | Server port (defaults to `3000`) |

You can get a key from [Google AI Studio](https://aistudio.google.com/apikey).

Set it before starting the server:

```bash
export GOOGLE_GENERATIVE_AI_API_KEY="your-key-here"
```

Or create a `.env` file in the `server/` directory and use a tool like `dotenv` to load it.

## Getting Started

### 1. Install dependencies

```bash
# From the weather-app/ root
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Build the shared library

The library must be built before the app can use it:

```bash
npm run build:lib
```

### 3. Start the backend server

**With a Gemini API key:**

```bash
cd server
GOOGLE_GENERATIVE_AI_API_KEY="your-key" npm run dev
```

**Without an API key (mock mode):**

If you don't have a Gemini API key, you can run the server with mock data that returns realistic static responses for all endpoints:

```bash
cd server
npm run dev:mock
```

Mock mode serves pre-built JSON responses so the full frontend works end-to-end without any external API calls.

The server starts on `http://localhost:3000` with these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/weather/agent` | AI agent - natural language weather queries |
| POST | `/api/weather/search` | Direct city geocoding search |
| POST | `/api/weather/current` | Direct current weather + 7-day forecast |
| GET | `/health` | Health check |

### 4. Start the Angular dev server

```bash
# From the weather-app/ root
npm start
```

Navigate to `http://localhost:4200/`.

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm start` | `ng serve weather-app` | Start the Angular dev server |
| `npm run build` | `ng build weather-app` | Production build of the app |
| `npm run build:lib` | `ng build lib` | Build the shared library |
| `npm run build:all` | `ng build lib && ng build weather-app` | Build everything |
| `npm test` | `ng test weather-app` | Run unit tests via Karma |

### Server Scripts (run from `server/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start server with live reload (requires Gemini API key) |
| `npm run dev:mock` | Start server with mock data (no API key needed) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled server |

## Running Tests

```bash
# Run all weather-app tests
npm test

# Run with watch mode
ng test weather-app --watch
```

Tests use Jasmine + Karma with `HttpClientTestingModule` for service tests and Angular `TestBed` for component tests.

## Tech Stack

### Frontend
- **Angular 21** with standalone components and signals
- **RxJS** for async data flows
- **Tailwind CSS** for styling
- **Custom store framework** (NgRx-like, see [Store README](projects/lib/STORE.md))

### Backend
- **Express.js** with TypeScript
- **Vercel AI SDK** (`ai` package) for LLM orchestration
- **Google Gemini** (`gemini-2.5-flash`) as the AI model
- **Open-Meteo API** for weather data (no API key required)

### AI Tools

The agent has access to four tools:

| Tool | Description |
|------|-------------|
| `searchCities` | Geocode city names via Open-Meteo Geocoding API |
| `getCurrentWeather` | Fetch current conditions (temperature, humidity, wind, weather code) |
| `getForecast` | Fetch 7-day daily forecast (high/low, precipitation probability) |
| `compareWeather` | Compare current weather between two cities |

## Project Structure Details

### Models (flat in `weather/`)
- `City` - id, name, country, admin1, latitude, longitude
- `CurrentWeather` - temperature, apparentTemperature, humidity, windSpeed, weatherCode
- `DailyForecast` - date, temperatureMax, temperatureMin, weatherCode, precipitationProbability

### State Management
The app uses a custom store framework from the shared library:
- **Actions**: `searchCities`, `selectCity`, `loadWeather`, `agentLoadWeather`, `toggleTemperatureUnit`
- **Reducer**: Pure functions mapping actions to state transitions
- **Selectors**: Memoized state derivations (`selectIsSearching`, `selectHasWeatherData`, etc.)
- **Effects**: Side-effect handlers for API calls (search debouncing, weather fetching with retry)

### Services (flat in `weather/`)
- `GeocodingApiService` - City search with result caching
- `WeatherApiService` - Current weather and forecast fetching
- `WeatherAgentService` - AI agent query proxy
