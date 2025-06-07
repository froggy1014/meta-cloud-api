import { resolve } from 'path';
import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        'features/messages/index': 'src/features/messages/index.ts',
        'features/media/index': 'src/features/media/index.ts',
        'features/profile/index': 'src/features/profile/index.ts',
        'features/flow/index': 'src/features/flow/index.ts',
        'features/phone/index': 'src/features/phone/index.ts',
        'features/template/index': 'src/features/template/index.ts',
        'features/qrCode/index': 'src/features/qrCode/index.ts',
        'features/registration/index': 'src/features/registration/index.ts',
        'features/encryption/index': 'src/features/encryption/index.ts',
        'features/twoStepVerification/index': 'src/features/twoStepVerification/index.ts',
        'features/waba/index': 'src/features/waba/index.ts',
        'shared/types/enums': 'src/shared/types/enums.ts',
        'shared/types/config': 'src/shared/types/config.ts',
        'shared/utils/isMetaError': 'src/shared/utils/isMetaError.ts',
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
            '@features': resolve(__dirname, 'src/features'),
            '@shared': resolve(__dirname, 'src/shared'),
        };
    },
});
