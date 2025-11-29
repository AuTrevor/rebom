import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
    const query = url.searchParams.get('q') || '';

    // @ts-ignore
    const db = locals.runtime.env.project965;

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
        // Join with parent locations to get hierarchy
        const results = await db.prepare(
            `SELECT 
                l.aac, 
                l.description, 
                l.type, 
                l.parent_aac,
                p.description as parent_description,
                gp.description as grandparent_description
             FROM bom_locations l
             LEFT JOIN bom_locations p ON l.parent_aac = p.aac
             LEFT JOIN bom_locations gp ON p.parent_aac = gp.aac
             WHERE l.description LIKE ? 
             AND l.type IN ('metropolitan-area', 'metropolitan', 'location')
             ORDER BY 
                CASE 
                    WHEN l.description = ? THEN 0
                    WHEN l.description LIKE ? THEN 1
                    ELSE 2
                END,
                l.description ASC
             LIMIT 5`
        ).bind(`%${query}%`, query, `${query}%`).all();

        const formattedResults = results.results.map((r: any) => {
            let hierarchy = r.description;
            if (r.parent_description) {
                hierarchy = `${r.parent_description} > ${hierarchy}`;
            }
            if (r.grandparent_description) {
                hierarchy = `${r.grandparent_description} > ${hierarchy}`;
            }

            return {
                aac: r.aac,
                description: r.description,
                type: r.type,
                hierarchy: hierarchy
            };
        });

        return new Response(JSON.stringify(formattedResults), {
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
