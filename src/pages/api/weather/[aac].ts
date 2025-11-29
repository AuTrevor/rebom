import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
    const { aac } = params;
    // @ts-ignore
    const db = locals.runtime.env.project965;

    if (!db) {
        return new Response('Database not bound', { status: 500 });
    }

    const location = await db.prepare('SELECT * FROM bom_locations WHERE aac = ?').bind(aac).first();

    if (!location) {
        return new Response('Location not found', { status: 404 });
    }

    const forecasts = await db.prepare('SELECT * FROM bom_forecasts WHERE aac = ? ORDER BY start_time_local ASC').bind(aac).all();

    return new Response(JSON.stringify({ location, forecasts: forecasts.results }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
