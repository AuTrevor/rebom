import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
    // @ts-ignore
    const db = locals.runtime.env.project965;

    if (!db) {
        return new Response('Database not bound', { status: 500 });
    }

    const locations = await db.prepare('SELECT * FROM bom_locations ORDER BY description ASC').all();

    return new Response(JSON.stringify(locations.results), {
        headers: { 'Content-Type': 'application/json' }
    });
}
