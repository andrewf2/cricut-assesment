import { City } from './city.model';
import { CurrentWeather, DailyForecast } from './weather.model';

export interface AgentResponse {
  message: string;
  data: {
    city?: City;
    cities?: City[];
    current?: CurrentWeather;
    forecast?: DailyForecast[];
    comparison?: any;
  };
  toolResults: Array<{ toolName: string; result: any }>;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}
