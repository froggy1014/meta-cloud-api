import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsdown';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { version } = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8')) as { version: string };
const define = { __SDK_VERSION__: JSON.stringify(version) };

const configs = defineConfig([
    // Main bundle (runtime-neutral: Node.js, Bun, Deno, Workers, Edge)
    {
        entry: ['src/index.ts'],
        format: ['esm'],
        dts: true,
        sourcemap: true,
        clean: true,
        minify: true,
        treeshake: true,
        target: 'es2022',
        platform: 'neutral',
        // Keep the .mjs/.d.mts names that package.json exports point to.
        fixedExtension: true,
        define,
        hash: false,
        deps: {
            neverBundle: ['node:*', 'crypto', 'fs', 'path', 'url', 'util'],
        },
        plugins: [
            {
                name: 'alias-resolver',
                resolveId(id: string) {
                    if (id.startsWith('@core/')) {
                        return resolve(__dirname, 'src/core', id.slice(6));
                    }
                    if (id.startsWith('@api/')) {
                        return resolve(__dirname, 'src/api', id.slice(5));
                    }
                    if (id.startsWith('@shared/')) {
                        return resolve(__dirname, 'src/shared', id.slice(8));
                    }
                    return null;
                },
            },
        ],
    },
    // Standalone enums and types for client-side
    {
        entry: ['src/types/enums.ts', 'src/types/index.ts'],
        outDir: 'dist/types',
        format: ['esm'],
        dts: true,
        clean: true,
        minify: true,
        treeshake: true,
        target: 'es2022',
        platform: 'neutral',
        define,
        hash: false,
    },
    {
        entry: ['src/utils/index.ts'],
        outDir: 'dist/utils',
        format: ['esm'],
        dts: true,
        clean: true,
        minify: true,
        treeshake: true,
        target: 'es2022',
        platform: 'neutral',
        define,
        hash: false,
    },
]);

export default defineConfig([
    ...configs,
    ...[configs[0], configs[2]].map((config) => ({
        ...config,
        outDir: config.outDir ? `${config.outDir}/node` : 'dist/node',
        plugins: [
            {
                name: 'node-runtime-crypto',
                resolveId(id: string) {
                    if (id === './runtimeCrypto') {
                        return resolve(__dirname, 'src/utils/runtimeCrypto.node.ts');
                    }
                    return null;
                },
            },
            ...(config.plugins ?? []),
        ],
    })),
]);
