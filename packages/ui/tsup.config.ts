import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
    entry: ['components/ui/**/*.{tsx,ts}'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: false,
    external: ['react'],
    ...options,
}));
