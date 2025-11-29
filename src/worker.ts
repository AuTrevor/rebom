
import { ingestBomData } from './lib/bom-ingest';

// Import the Astro worker
// @ts-ignore
import astroWorker from '../dist/_worker.js/index.js';

export default {
    async fetch(request: Request, env: any, ctx: any) {
        return astroWorker.fetch(request, env, ctx);
    },

    async scheduled(event: any, env: any, ctx: any) {
        console.log('Scheduled event triggered');
        ctx.waitUntil(ingestBomData(env.project965));
    }
};
