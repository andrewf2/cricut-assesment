import express from 'express';
import cors from 'cors';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { weatherTools } from './weather-tools.js';
import { findMockCity, buildMockAgentResponse, MOCK_CURRENT_WEATHER, MOCK_FORECAST } from './mock/mock-data.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const MOCK_MODE = process.env.MOCK_MODE === 'true';
const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

const google = createGoogleGenerativeAI({ apiKey: GOOGLE_API_KEY });
const model = google('gemini-2.5-flash');

const SYSTEM_PROMPT = `You are a weather assistant agent. You have access to tools that interact with the Open-Meteo weather API.

When the user asks about weather, follow this workflow:
1. If they give a city name, use searchCities to find coordinates first (pick the top result).
2. Then ALWAYS call BOTH getCurrentWeather AND getForecast with those coordinates — the frontend needs both.
3. If they ask to compare two places, use compareWeather.

Always return structured data. When returning weather data, include ALL the raw numeric data from the tools — the frontend will handle display formatting.

IMPORTANT: Your response must be valid JSON with this shape:
{
  "message": "A brief natural-language summary",
  "data": { ... the structured tool results ... }
}

For a city search, data should have: { "cities": [...] }
For weather, data should have: { "city": {...}, "current": {...}, "forecast": [...] }
For comparison, data should have: { "comparison": {...} }`;

/**
 * POST /api/weather/agent
 * Body: { query: string, context?: { latitude?: number, longitude?: number, city?: string, unit?: string } }
 *
 * The AI agent interprets the natural-language query, calls the appropriate
 * weather tools, and returns structured data the frontend can consume.
 */
app.post('/api/weather/agent', async (req, res) => {
  try {
    const { query, context } = req.body as {
      query: string;
      context?: { latitude?: number; longitude?: number; city?: string; unit?: string };
    };

    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    if (MOCK_MODE) {
      console.log(`🤖 [MOCK] Agent request: "${query}"`);
      return res.json(buildMockAgentResponse(query));
    }

    console.log(`\n🤖 Agent request: "${query}"`);
    if (context) console.log(`   Context:`, context);

    const contextHint = context
      ? `\nUser context: ${JSON.stringify(context)}`
      : '';

    const result = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt: `${query}${contextHint}`,
      tools: weatherTools,
      maxSteps: 5,
      temperature: 0.3,
    });

    console.log(`✅ Agent response generated (${result.steps.length} steps, ${result.toolCalls?.length ?? 0} tool calls)`);

    // Try to parse the AI's text as JSON, fallback to wrapping it
    let parsed: any;
    try {
      // Extract JSON from potential markdown code fences
      const jsonMatch = result.text.match(/```json\s*([\s\S]*?)```/) || result.text.match(/```\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : result.text;
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { message: result.text, data: {} };
    }

    // Attach the raw tool results for the frontend to use directly
    const toolResults = result.steps
      .flatMap((step) => step.toolResults ?? [])
      .map((tr: any) => ({ toolName: tr.toolName, result: tr.result }));

    res.json({
      message: parsed.message ?? result.text,
      data: parsed.data ?? {},
      toolResults,
      usage: result.usage,
    });
  } catch (error: any) {
    console.error('❌ Agent error:', error?.message ?? error);
    res.status(500).json({ error: 'Agent request failed', details: error?.message });
  }
});

/**
 * POST /api/weather/search
 * Body: { query: string }
 * Direct city search — bypasses the AI agent for simple autocomplete.
 */
app.post('/api/weather/search', async (req, res) => {
  try {
    const { query } = req.body as { query: string };
    if (!query || query.trim().length < 2) {
      return res.json({ cities: [] });
    }

    if (MOCK_MODE) {
      console.log(`🔍 [MOCK] Direct search: "${query}"`);
      return res.json({ cities: findMockCity(query) });
    }

    console.log(`🔍 Direct search: "${query}"`);

    const result = await weatherTools.searchCities.execute(
      { query, limit: 8 },
      { toolCallId: 'direct', messages: [], abortSignal: undefined as any },
    );
    res.json(result);
  } catch (error: any) {
    console.error('❌ Search error:', error?.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * POST /api/weather/current
 * Body: { latitude: number, longitude: number, unit?: string }
 * Direct current weather fetch — bypasses the AI agent.
 */
app.post('/api/weather/current', async (req, res) => {
  try {
    const { latitude, longitude, unit } = req.body as {
      latitude: number;
      longitude: number;
      unit?: 'fahrenheit' | 'celsius';
    };

    if (MOCK_MODE) {
      console.log(`🌡️  [MOCK] Direct current weather: (${latitude}, ${longitude})`);
      return res.json({ current: MOCK_CURRENT_WEATHER, forecast: MOCK_FORECAST });
    }

    console.log(`🌡️  Direct current weather: (${latitude}, ${longitude})`);

    const current = await weatherTools.getCurrentWeather.execute(
      { latitude, longitude, temperatureUnit: unit ?? 'fahrenheit' },
      { toolCallId: 'direct', messages: [], abortSignal: undefined as any },
    );

    const forecastResult = await weatherTools.getForecast.execute(
      { latitude, longitude, days: 7, temperatureUnit: unit ?? 'fahrenheit' },
      { toolCallId: 'direct', messages: [], abortSignal: undefined as any },
    );

    res.json({ current, forecast: forecastResult.forecast });
  } catch (error: any) {
    console.error('❌ Weather error:', error?.message);
    res.status(500).json({ error: 'Weather fetch failed' });
  }
});

/**
 * GET /health
 */
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    tools: Object.keys(weatherTools),
    aiProvider: MOCK_MODE ? 'mock' : 'google-gemini',
    agentEnabled: !MOCK_MODE,
    mockMode: MOCK_MODE,
  });
});

app.listen(port, () => {
  console.log(`\n🚀 Weather Agent Server running on port ${port}`);
  console.log(`   POST /api/weather/agent   — AI-powered natural language weather queries`);
  console.log(`   POST /api/weather/search  — Direct city search`);
  console.log(`   POST /api/weather/current — Direct weather fetch`);
  console.log(`   GET  /health              — Health check`);
  console.log(`   🛠️  Tools: ${Object.keys(weatherTools).join(', ')}`);
  if (MOCK_MODE) {
    console.log('   📦 MOCK MODE — serving static responses (no API key needed)');
  } else if (!GOOGLE_API_KEY) {
    console.warn('   ⚠️  No Google API key found — agent endpoint will fail');
    console.warn('   💡 Tip: Run with MOCK_MODE=true to use mock data instead');
  }
});

export default app;
