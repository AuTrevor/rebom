
import { ingestBomData } from './lib/bom-ingest';

// Import the Astro worker
// @ts-ignore
import astroWorker from '../dist/_worker.js/index.js';

export default {
    async fetch(request: Request, env: any, ctx: any) {
        // Polyfill env.ASSETS for local development if missing
        if (!env.ASSETS) {
            env.ASSETS = {
                fetch: (req: Request | string) => {
                    return new Response("Not Found", { status: 404 });
                }
            };
        }
        return astroWorker.fetch(request, env, ctx);
    },

    async scheduled(event: any, env: any, ctx: any) {
        ctx.waitUntil(ingestBomData(env.project965));
    }
};
