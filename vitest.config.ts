import { config } from 'dotenv';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        clearMocks: true,
        exclude: ['**/node_modules/**', '**/dist/**', '**/examples/**', '**/website/**'],
        env: {
            ...config({ path: '.env.test' }).parsed,
        },
    },
    resolve: {
        alias: {
            '@core': path.resolve(__dirname, './src/core'),
            '@features': path.resolve(__dirname, './src/features'),
            '@shared': path.resolve(__dirname, './src/shared'),
        },
    },
});
