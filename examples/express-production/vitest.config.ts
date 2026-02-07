import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./tests/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: [
                'node_modules/**',
                'dist/**',
                'tests/**',
                '**/*.test.ts',
                '**/*.spec.ts',
                'src/types/**',
                'prisma/**',
            ],
            all: true,
            lines: 80,
            functions: 80,
            branches: 80,
            statements: 80,
        },
        testTimeout: 10000,
        hookTimeout: 10000,
    },
    resolve: {
        alias: {
            '@config': path.resolve(__dirname, './src/config'),
            '@middleware': path.resolve(__dirname, './src/middleware'),
            '@services': path.resolve(__dirname, './src/services'),
            '@handlers': path.resolve(__dirname, './src/handlers'),
            '@routes': path.resolve(__dirname, './src/routes'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@types': path.resolve(__dirname, './src/types'),
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
});
