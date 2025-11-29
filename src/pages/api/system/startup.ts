import type { APIRoute } from 'astro';
import { ingestBomData } from '../../../lib/bom-ingest';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
    // @ts-ignore
    const db = locals.runtime.env.DB;

    if (!db) {
        return new Response('Database not bound', { status: 500 });
    }

    try {
        // Check if we have any locations
        const countResult = await db.prepare('SELECT count(*) as c FROM bom_locations LIMIT 1').first();
        const count = countResult ? countResult.c : 0;

        if (count === 0) {
            console.log('Database empty, triggering initial ingestion...');
            await ingestBomData(db);
            return new Response(JSON.stringify({ ingested: true }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ ingested: false }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Startup check failed:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
