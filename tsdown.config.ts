import { resolve } from 'path';
import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        entry: [
            'src/index.ts',
            'src/api/index.ts',
            'src/api/messages/index.ts',
            'src/api/messages/builders/index.ts',
            'src/api/media/index.ts',
            'src/api/profile/index.ts',
            'src/api/flow/index.ts',
            'src/api/phone/index.ts',
            'src/api/template/index.ts',
            'src/api/qrCode/index.ts',
            'src/api/registration/index.ts',
            'src/api/encryption/index.ts',
            'src/api/twoStepVerification/index.ts',
            'src/api/waba/index.ts',
            'src/types/index.ts',
            'src/utils/index.ts',
            'src/core/webhook/index.ts',
            'src/core/webhook/frameworks/express.ts',
            'src/core/webhook/frameworks/nextjs.ts',
            'src/core/webhook/frameworks/nextjs-app.ts',
            'src/core/whatsapp/index.ts',
        ],
        format: ['esm'],
        dts: true,
        sourcemap: true,
        clean: true,
        minify: true,
        treeshake: true,
        target: 'es2022',
        platform: 'node',
        external: ['node:*', 'crypto', 'fs', 'path', 'url', 'util'],
        exports: true,
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
]);
