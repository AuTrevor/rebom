import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
    const query = url.searchParams.get('q') || '';

    // @ts-ignore
    const db = locals.runtime.env.DB;

    if (!db) {
        return new Response('Database not bound', { status: 500 });
    }

    if (query.length < 2) {
        // Don't search for very short queries
        return new Response(JSON.stringify([]), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Search for locations matching the query
        // Order by: exact match first, starts with match second, contains match third
        const results = await db.prepare(
            `SELECT aac, description, type, parent_aac
             FROM bom_locations 
             WHERE description LIKE ? 
             AND type IN ('metropolitan-area', 'metropolitan', 'location')
             ORDER BY 
                CASE 
                    WHEN description = ? THEN 0
                    WHEN description LIKE ? THEN 1
                    ELSE 2
                END,
                description ASC
             LIMIT 3`
        ).bind(`%${query}%`, query, `${query}%`).all();

        return new Response(JSON.stringify(results.results || []), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Error searching cities:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error', message: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
