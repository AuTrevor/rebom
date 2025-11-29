import type { APIRoute } from 'astro';
import { ingestBomData } from '../../../lib/bom-ingest';

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
    // @ts-ignore
    const db = locals.runtime.env.project965;

    if (!db) {
        return new Response('Database not bound', { status: 500 });
    }

    try {
        const results = await ingestBomData(db);
        return new Response(JSON.stringify({ success: true, results }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
