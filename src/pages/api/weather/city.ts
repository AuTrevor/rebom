import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
    const cityName = url.searchParams.get('name') || 'Sydney';

    // @ts-ignore
    const db = locals.runtime.env.DB;

    if (!db) {
        return new Response('Database not bound', { status: 500 });
    }

    try {
        // Search for locations that match the city name
        // Using LIKE for fuzzy matching - matches "Sydney" in "Sydney - City", etc.
        // Search for locations that match the city name
        // Using LIKE for fuzzy matching - matches "Sydney" in "Sydney - City", etc.
        const location = await db.prepare(
            `SELECT 
                l.*,
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
             LIMIT 1`
        ).bind(`%${cityName}%`, cityName, `${cityName}%`).first();

        if (!location) {
            return new Response(
                JSON.stringify({ error: 'City not found', city: cityName }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get forecasts for this location
        const forecasts = await db.prepare(
            `SELECT * FROM bom_forecasts 
             WHERE aac = ? 
             ORDER BY start_time_local ASC`
        ).bind(location.aac).all();

        // Determine product ID prefix from AAC to fetch metadata
        let productIdPrefix = '';
        if (location.aac.startsWith('NSW')) productIdPrefix = 'IDN';
        else if (location.aac.startsWith('VIC')) productIdPrefix = 'IDV';
        else if (location.aac.startsWith('QLD')) productIdPrefix = 'IDQ';
        else if (location.aac.startsWith('WA')) productIdPrefix = 'IDW';
        else if (location.aac.startsWith('TAS')) productIdPrefix = 'IDT';
        else if (location.aac.startsWith('NT')) productIdPrefix = 'IDD';
        else if (location.aac.startsWith('SA')) productIdPrefix = 'IDS';

        let metadata = null;
        if (productIdPrefix) {
            metadata = await db.prepare(
                `SELECT issue_time_local, issue_time_local_tz 
                 FROM bom_metadata 
                 WHERE product_id LIKE ? 
                 ORDER BY fetched_at DESC LIMIT 1`
            ).bind(`${productIdPrefix}%`).first();
        }

        // Construct hierarchy string
        let hierarchy = location.description;
        if (location.parent_description) {
            hierarchy = `${location.parent_description} > ${hierarchy}`;
        }
        if (location.grandparent_description) {
            hierarchy = `${location.grandparent_description} > ${hierarchy}`;
        }

        return new Response(JSON.stringify({
            location: {
                ...location,
                hierarchy
            },
            metadata: metadata || {},
            forecasts: forecasts.results || []
        }), {
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
