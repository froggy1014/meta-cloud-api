import { FlatCompat } from '@eslint/eslintrc';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';
import baseConfig from './base.ts';
import hooksPlugin from 'eslint-plugin-react-hooks';

const compat = new FlatCompat();

// ? https://github.com/jsx-eslint/eslint-plugin-react?tab=readme-ov-file#configuring-shared-settings
// ? https://github.com/facebook/react/issues/28313
const config = [
    ...baseConfig,
    // * React plugin configuration
    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            react: reactPlugin,
        },
        languageOptions: {
            globals: {
                ...globals.serviceworker,
                ...globals.browser,
            },
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },

    // * React Hooks plugin configuration
    ...compat.extends('plugin:react-hooks/recommended'),
    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            'react-hooks': hooksPlugin,
        },
        rules: {
            ...hooksPlugin.configs.recommended.rules,
        },
    },
    eslintConfigPrettier,
];

export default config;
