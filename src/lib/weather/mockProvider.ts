// src/lib/weather/mockProvider.ts
import type { WeatherProvider, WeatherData, DailyForecast, HourlyForecast } from './types';

export class MockWeatherProvider implements WeatherProvider {
  async getWeather(location: string): Promise<WeatherData> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Generate current date
    const today = new Date();

    return {
      location: {
        name: location || "Sydney",
        state: "NSW",
        postcode: "2000"
      },
      current: {
        temperature: 24,
        feelsLike: 26,
        humidity: 65,
        pressure: 1012,
        uvIndex: 11,
        windSpeed: 15,
        windDirection: "S",
        icon: "sunny",
        description: "Sunny"
      },
      forecast: this.generateForecast(today)
    };
  }

  private generateForecast(startDate: Date): DailyForecast[] {
    const days: DailyForecast[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isRainy = i === 2 || i === 5; // Fake some rain on specific days
      const minTemp = 14 + Math.floor(Math.random() * 5);
      const maxTemp = 22 + Math.floor(Math.random() * 8);

      days.push({
        date: date.toISOString().split('T')[0],
        dayName: i === 0 ? "Today" : dayNames[date.getDay()],
        icon: isRainy ? "rain" : (i % 3 === 0 ? "partly-cloudy" : "sunny"),
        minTemp,
        maxTemp,
        rainProbability: isRainy ? 80 : 10,
        rainAmountRange: isRainy ? "5-10mm" : "0mm",
        windSpeedRange: "15-20km/h",
        windDirection: "SE",
        summary: isRainy
          ? "Showers increasing. Possible storm in the afternoon."
          : "Mostly sunny with light winds becoming southeasterly.",
        hourlyBreakdown: this.generateHourly(isRainy)
      });
    }
    return days;
  }

  private generateHourly(isRainy: boolean): HourlyForecast[] {
    const hours: HourlyForecast[] = [];
    for (let i = 0; i < 24; i += 3) {
        hours.push({
            time: `${i.toString().padStart(2, '0')}:00`,
            temp: 18 + Math.floor(Math.random() * 10),
            icon: isRainy && i > 9 ? "rain" : "sunny",
            rainProbability: isRainy && i > 9 ? 70 : 0
        });
    }
    return hours;
  }
}
