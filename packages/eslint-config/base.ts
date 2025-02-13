import js from '@eslint/js';
import type { Linter } from 'eslint';
import turbo from 'eslint-plugin-turbo';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

// ? https://github.com/bfanger/eslint-plugin-only-warn/issues/13
import 'eslint-plugin-only-warn';

const config = [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    turbo.configs['flat/recommended'],
    {
        plugins: {
            'unused-imports': unusedImports,
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'off',
            'unused-imports/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            'unused-imports/no-unused-imports': 'error',
        },
    },
] as Linter.Config[];

export default config;
