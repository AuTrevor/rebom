/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
    test: {
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
        setupFiles: ['./vitest.setup.ts'],
        server: {
            deps: {
                inline: ['@astrojs/svelte']
            }
        }
    },
    resolve: {
        conditions: ['browser', 'development', 'default'],
    }
});
