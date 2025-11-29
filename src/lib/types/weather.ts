export interface WeatherLocation {
    name: string;
    aac: string;
    hierarchy: string;
    lat: number;
    lon: number;
}

export interface WeatherMetadata {
    issueTime: string;
    issueTimeTz: string;
}

export interface CurrentWeather {
    temperature: number;
    feelsLike: number;
    description: string;
    windDirection: string;
    windSpeed: number | string;
    humidity: number | string;
    pressure: number | string;
}

export interface Forecast {
    date: string;
    dayName: string;
    minTemp: number | null;
    maxTemp: number | null;
    iconCode: string | null;
    icon: string;
    summary: string;
    rainProbability: number;
    rainAmountRange: string;
    windDirection: string;
    windSpeedRange: string;
    hourlyBreakdown: any[]; // Define more specific type if available
}

export interface Warning {
    id: string;
    location_name: string;
    state: string;
    description: string;
    expiry_time: string;
    severity: string;
    created_at: number;
}

export interface WeatherData {
    location: WeatherLocation;
    metadata: WeatherMetadata;
    current: CurrentWeather;
    forecast: Forecast[];
    warnings: Warning[];
}
