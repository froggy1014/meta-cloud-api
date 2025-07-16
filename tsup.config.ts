import { resolve } from 'path';
import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        'api/index': 'src/api/index.ts',
        'api/messages/index': 'src/api/messages/index.ts',
        'api/messages/builders/index': 'src/api/messages/builders/index.ts',
        'api/media/index': 'src/api/media/index.ts',
        'api/profile/index': 'src/api/profile/index.ts',
        'api/flow/index': 'src/api/flow/index.ts',
        'api/phone/index': 'src/api/phone/index.ts',
        'api/template/index': 'src/api/template/index.ts',
        'api/qrCode/index': 'src/api/qrCode/index.ts',
        'api/registration/index': 'src/api/registration/index.ts',
        'api/encryption/index': 'src/api/encryption/index.ts',
        'api/twoStepVerification/index': 'src/api/twoStepVerification/index.ts',
        'api/waba/index': 'src/api/waba/index.ts',
        'types/index': 'src/types/index.ts',
        'types/enums': 'src/types/enums.ts',
        'types/config': 'src/types/config.ts',
        'utils/index': 'src/utils/index.ts',
        'core/webhook/index': 'src/core/webhook/index.ts',
        'core/webhook/frameworks/express': 'src/core/webhook/frameworks/express.ts',
        'core/webhook/frameworks/nextjs': 'src/core/webhook/frameworks/nextjs.ts',
        'core/whatsapp/index': 'src/core/whatsapp/index.ts',
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
    esbuildOptions(options) {
        options.alias = {
            '@core': resolve(__dirname, 'src/core'),
            '@api': resolve(__dirname, 'src/api'),
            '@shared': resolve(__dirname, 'src/shared'),
        };
    },
});
