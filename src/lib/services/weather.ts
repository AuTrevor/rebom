import type { WeatherData } from "../types/weather";
import { getIconFromCode } from "../weather/icons";

export class WeatherService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async getCityWeather(cityName: string): Promise<WeatherData | null> {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/weather/city?name=${encodeURIComponent(cityName)}`
            );

            if (!response.ok) {
                console.error(`Failed to fetch weather data: ${response.statusText}`);
                return null;
            }

            const data = await response.json();
            return transformWeatherData(data);
        } catch (error) {
            console.error("Error fetching weather:", error);
            return null;
        }
    }
}

export function transformWeatherData(data: any): WeatherData | null {
    // Transform database data to match the expected WeatherData structure
    if (data && data.location && data.forecasts) {
        const forecasts = data.forecasts;

        // Get today's forecast for current conditions
        const todayForecast = forecasts[0] || {};

        return {
            location: {
                name: data.location.description,
                aac: data.location.aac,
                hierarchy: data.location.hierarchy || data.location.description,
                lat: data.location.lat,
                lon: data.location.lon
            },
            metadata: {
                issueTime: data.metadata?.issue_time_local,
                issueTimeTz: data.metadata?.issue_time_local_tz
            },
            current: {
                temperature: todayForecast.max_temp,
                feelsLike: todayForecast.max_temp,
                description: todayForecast.precis,
                windDirection: "",
                windSpeed: "",
                humidity: "",
                pressure: "",
            },
            forecast: forecasts.slice(0, 7).map((f: any) => ({
                date: f.start_time_local,
                dayName: new Date(f.start_time_local).toLocaleDateString(
                    "en-AU",
                    { weekday: "short" },
                ),
                minTemp: f.min_temp,
                maxTemp: f.max_temp,
                iconCode: f.icon_code,
                icon: getIconFromCode(f.icon_code),
                summary: f.precis || "",
                rainProbability: parseInt(f.prob_precip) || 0,
                rainAmountRange: f.precip_range || "",
                windDirection: "N/A",
                windSpeedRange: "",
                hourlyBreakdown: []
            })),
            warnings: data.warnings || []
        };
    }
    return null;
}
