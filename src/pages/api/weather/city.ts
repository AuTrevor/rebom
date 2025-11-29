import type { APIRoute } from 'astro';
import { getCityWeatherRaw } from '../../../lib/server/weather';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
    const cityName = url.searchParams.get('name') || 'Sydney';

    // @ts-ignore
    const db = locals.runtime.env.DB;

    if (!db) {
        return new Response('Database not bound', { status: 500 });
    }

    try {
        const weatherData = await getCityWeatherRaw(db, cityName);

        if (!weatherData) {
            return new Response(
                JSON.stringify({ error: 'City not found', city: cityName }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(JSON.stringify(weatherData), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Error fetching city weather:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error', message: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
