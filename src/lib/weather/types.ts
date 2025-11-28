// src/lib/weather/types.ts

export type UnitSystem = 'metric' | 'imperial';

export interface WeatherCondition {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  uvIndex: number;
  windSpeed: number;
  windDirection: string; // e.g., "SE"
  icon: string; // internal icon identifier (e.g., 'sunny', 'rain')
  description: string;
}

export interface DailyForecast {
  date: string; // ISO date YYYY-MM-DD
  dayName: string; // Mon, Tue, etc.
  icon: string;
  minTemp: number;
  maxTemp: number;
  rainProbability: number; // 0-100
  rainAmountRange: string; // e.g., "1-5mm"
  windSpeedRange: string; // e.g., "15-20km/h"
  windDirection: string;
  summary: string; // Text summary
  hourlyBreakdown: HourlyForecast[];
}

export interface HourlyForecast {
  time: string; // HH:MM
  temp: number;
  icon: string;
  rainProbability: number;
}

export interface WeatherData {
  location: {
    name: string;
    state: string;
    postcode: string;
  };
  current: WeatherCondition;
  forecast: DailyForecast[];
}

export interface WeatherProvider {
  getWeather(location: string): Promise<WeatherData>;
}
