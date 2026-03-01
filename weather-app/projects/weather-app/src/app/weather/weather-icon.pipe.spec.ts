import { WeatherIconPipe } from './weather-icon.pipe';
import { WEATHER_CODE_MAP } from './weather-code.map';
import { UNKNOWN_WEATHER_CODE } from './models.const';

describe('WeatherIconPipe', () => {
  let pipe: WeatherIconPipe;

  beforeEach(() => {
    pipe = new WeatherIconPipe();
  });

  it('should return the correct emoji for a known weather code', () => {
    expect(pipe.transform(0)).toBe(WEATHER_CODE_MAP[0].emoji);
    expect(pipe.transform(3)).toBe(WEATHER_CODE_MAP[3].emoji);
    expect(pipe.transform(95)).toBe(WEATHER_CODE_MAP[95].emoji);
  });

  it('should return unknown emoji for null', () => {
    expect(pipe.transform(null)).toBe(UNKNOWN_WEATHER_CODE.emoji);
  });

  it('should return unknown emoji for undefined', () => {
    expect(pipe.transform(undefined)).toBe(UNKNOWN_WEATHER_CODE.emoji);
  });

  it('should return unknown emoji for an unmapped weather code', () => {
    expect(pipe.transform(999)).toBe(UNKNOWN_WEATHER_CODE.emoji);
  });

  it('should return clear sky emoji for code 0', () => {
    expect(pipe.transform(0)).toBe('☀️');
  });

  it('should return thunderstorm emoji for code 95', () => {
    expect(pipe.transform(95)).toBe('⛈️');
  });
});
