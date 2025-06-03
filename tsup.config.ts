import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        'api/index': 'src/api/index.ts',
        'types/index': 'src/types/index.ts',
        'utils/index': 'src/utils/index.ts',
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
    external: [
        // Node.js 내장 모듈들
        'node:*',
        'crypto',
        'fs',
        'path',
        'url',
        'util',
    ],
});
