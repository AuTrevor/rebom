import { ingestBomData } from './lib/bom-ingest';

export default {
    async fetch(request: Request, env: any, ctx: any) {
        const url = new URL(request.url);
        if (url.pathname === '/test-ingest') {
            try {
                console.log('Starting ingestion...');
                const results = await ingestBomData(env.DB);

                // Verify data
                const locations = await env.DB.prepare('SELECT * FROM bom_locations').all();
                const forecasts = await env.DB.prepare('SELECT * FROM bom_forecasts').all();

                return new Response(JSON.stringify({
                    ingestResults: results,
                    verification: {
                        locationsCount: locations.results.length,
                        forecastsCount: forecasts.results.length,
                        warningsCount: (await env.DB.prepare('SELECT COUNT(*) as count FROM bom_warnings').first()).count
                    }
                }, null, 2), {
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (e: any) {
                console.error(e);
                return new Response(e.stack || e.message, { status: 500 });
            }
        }
        return new Response('Use /test-ingest to trigger ingestion', { status: 404 });
    }
};
