import eslintConfigPrettier from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';
import baseConfig from './base';

// @ts-ignore
import hooksPlugin from 'eslint-plugin-react-hooks';
// @ts-ignore
import pluginNext from '@next/eslint-plugin-next';

const nextJsConfig = [
    ...baseConfig,
    {
        plugins: {
            '@next/next': pluginNext,
        },
        rules: {
            ...pluginNext.configs.recommended.rules,
            ...pluginNext.configs['core-web-vitals'].rules,
        },
    },
    {
        files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
        ...reactPlugin.configs.flat?.recommended,
        languageOptions: {
            ...reactPlugin.configs.flat?.recommended?.languageOptions,
            globals: {
                ...globals.serviceworker,
                ...globals.browser,
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
        },
    },
    {
        plugins: {
            'react-hooks': hooksPlugin,
        },
        rules: hooksPlugin.configs.recommended.rules,
    },
    eslintConfigPrettier,
    {
        ignores: ['./dist', 'node_modules', '.next/*'],
    },
];

export default nextJsConfig;
