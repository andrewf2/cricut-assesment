import { City } from './city.model';
import { CurrentWeather, DailyForecast } from './weather.model';

export interface AgentResponseData {
  city?: City;
  cities?: City[];
  current?: CurrentWeather;
  forecast?: DailyForecast[];
  comparison?: Record<string, any>;
}

export interface AgentToolResult {
  toolName: string;
  result: any;
}

export interface AgentUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AgentResponse {
  message: string;
  data: AgentResponseData;
  toolResults: AgentToolResult[];
  usage: AgentUsage;
}
