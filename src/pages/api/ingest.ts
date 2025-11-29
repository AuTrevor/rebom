import type { APIRoute } from 'astro';
import { ingestBomData } from '../../lib/bom-ingest';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
    // Basic security: Check for a secret header
    // In production, you should set a CRON_SECRET env var
    // const authHeader = request.headers.get('Authorization');
    // if (authHeader !== `Bearer ${import.meta.env.CRON_SECRET}`) {
    //    return new Response('Unauthorized', { status: 401 });
    // }

    // Access D1 from locals (Cloudflare adapter puts env in locals.runtime.env)
    // @ts-ignore
    const db = locals.runtime.env.DB;

    if (!db) {
        return new Response('Database not bound', { status: 500 });
    }

    try {
        const results = await ingestBomData(db);
        return new Response(JSON.stringify({ success: true, results }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ success: false, error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
