import { resolve } from 'node:path';
import { defineConfig } from 'tsdown';

export default defineConfig([
    // Main bundle for Node.js
    {
        entry: ['src/index.ts'],
        format: ['esm'],
        dts: true,
        sourcemap: true,
        clean: true,
        minify: true,
        treeshake: true,
        target: 'es2022',
        platform: 'node',
        hash: false,
        external: ['node:*', 'crypto', 'fs', 'path', 'url', 'util'],
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
        hash: false,
    },
]);
