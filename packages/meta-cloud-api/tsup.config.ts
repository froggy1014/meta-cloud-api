import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/*.ts', 'src/types/*.ts', 'src/api/*.ts', 'src/utils/*.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: true,
    splitting: false,
});
