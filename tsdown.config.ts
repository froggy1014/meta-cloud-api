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

// meta-cloud-api/testing imports the SDK from the main bundle instead of
// bundling it, so its types, enums and error classes are the SDK's own. The
// Node variant points at the Node main bundle so both resolve to one instance.
const testing = (sdkPath: string, outDir: string, dts: boolean) => ({
    entry: ['src/testing/index.ts'],
    outDir,
    format: ['esm' as const],
    dts,
    clean: true,
    minify: true,
    treeshake: true,
    target: 'es2022' as const,
    platform: 'neutral' as const,
    define,
    hash: false,
    plugins: [
        {
            name: 'external-sdk',
            resolveId(id: string) {
                return id === 'meta-cloud-api' ? { id: sdkPath, external: true } : null;
            },
        },
    ],
});

export default defineConfig([
    ...configs,
    testing('../index.mjs', 'dist/testing', true),
    testing('../../node/index.mjs', 'dist/testing/node', false),
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
