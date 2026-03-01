import { createAction } from 'lib';
import { City } from '../city.model';
import { AgentResponse } from '../agent-response.model';
import { CurrentWeather, DailyForecast } from '../weather.model';

export const searchCities = createAction<'[Weather] Search Cities', string>('[Weather] Search Cities');
export const searchCitiesSuccess = createAction<'[Weather] Search Cities Success', City[]>('[Weather] Search Cities Success');
export const searchCitiesFailure = createAction<'[Weather] Search Cities Failure', string>('[Weather] Search Cities Failure');
export const clearSearch = createAction('[Weather] Clear Search');

export const selectCity = createAction<'[Weather] Select City', City>('[Weather] Select City');

export const loadWeather = createAction<'[Weather] Load Weather', { latitude: number; longitude: number }>('[Weather] Load Weather');
export const loadWeatherSuccess = createAction<'[Weather] Load Weather Success', { current: CurrentWeather; forecast: DailyForecast[] }>('[Weather] Load Weather Success');
export const loadWeatherFailure = createAction<'[Weather] Load Weather Failure', string>('[Weather] Load Weather Failure');

export const toggleTemperatureUnit = createAction('[Weather] Toggle Temperature Unit');

export const agentQuery = createAction<'[Weather] Agent Query', string>('[Weather] Agent Query');
export const agentQuerySuccess = createAction<'[Weather] Agent Query Success', AgentResponse>('[Weather] Agent Query Success');
export const agentQueryFailure = createAction<'[Weather] Agent Query Failure', string>('[Weather] Agent Query Failure');

export type WeatherAction =
  | ReturnType<typeof searchCities>
  | ReturnType<typeof searchCitiesSuccess>
  | ReturnType<typeof searchCitiesFailure>
  | ReturnType<typeof clearSearch>
  | ReturnType<typeof selectCity>
  | ReturnType<typeof loadWeather>
  | ReturnType<typeof loadWeatherSuccess>
  | ReturnType<typeof loadWeatherFailure>
  | ReturnType<typeof toggleTemperatureUnit>
  | ReturnType<typeof agentQuery>
  | ReturnType<typeof agentQuerySuccess>
  | ReturnType<typeof agentQueryFailure>;
