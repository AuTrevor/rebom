import { describe, it, expect, vi } from 'vitest';
import { MockWeatherProvider } from './mockProvider';

describe('MockWeatherProvider', () => {
    it('returns weather data for a location', async () => {
        const provider = new MockWeatherProvider();
        const data = await provider.getWeather('Sydney');

        expect(data).toBeDefined();
        expect(data.location.name).toBe('Sydney');
        expect(data.location.state).toBe('NSW');
        expect(data.current).toBeDefined();
        expect(data.forecast).toHaveLength(7);
    });

    it('generates 7 days of forecast', async () => {
        const provider = new MockWeatherProvider();
        const data = await provider.getWeather('Melbourne');
        const forecast = data.forecast;

        expect(forecast).toHaveLength(7);
        expect(forecast[0].dayName).toBe('Today');

        // Check date sequencing
        const today = new Date();
        const firstDate = new Date(forecast[0].date);

        // Allow for minor time zone differences in test execution
        expect(firstDate.getDate()).toBe(today.getDate());
    });

    it('generates hourly breakdowns', async () => {
        const provider = new MockWeatherProvider();
        const data = await provider.getWeather('Brisbane');

        data.forecast.forEach(day => {
            expect(day.hourlyBreakdown).toBeDefined();
            expect(day.hourlyBreakdown.length).toBeGreaterThan(0);
        });
    });
});
