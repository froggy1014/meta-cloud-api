import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
    },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: true,
    splitting: true,
    treeshake: true,
    target: 'es2022',
    platform: 'node',
    external: ['node:*', 'crypto', 'fs', 'path', 'url', 'util'],
});
