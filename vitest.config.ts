import { readFileSync } from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'vitest/config';

const { version } = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8')) as { version: string };

export default defineConfig({
    define: {
        __SDK_VERSION__: JSON.stringify(version),
    },
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
