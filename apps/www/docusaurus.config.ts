import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: 'Meta Cloud API',
    tagline: 'Build powerful WhatsApp integrations',
    favicon: 'img/favicon.ico',

    // Set the production url of your site here
    url: `https://${process.env.VERCEL_URL}`,
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'meta-cloud-api', // Usually your GitHub org/user name.
    projectName: 'meta-cloud-api', // Usually your repo name.

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    plugins: ['./src/plugins/tailwind-config.js'],

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl: 'https://github.com/froggy1014/meta-cloud-api',
                },
                theme: {
                    customCss: './src/css/custom.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        navbar: {
            title: 'Meta Cloud API',
            logo: {
                alt: 'Meta Cloud API Logo',
                src: 'img/logo.svg',
            },
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'apiReference',
                    position: 'left',
                    label: 'Documentation',
                },
                {
                    href: 'https://github.com/froggy1014/meta-cloud-api',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [
                        {
                            label: 'Getting Started',
                            to: '/docs/intro',
                        },
                    ],
                },
                {
                    title: 'Community',
                    items: [
                        {
                            label: 'GitHub',
                            href: 'https://github.com/froggy1014/meta-cloud-api',
                        },
                        {
                            label: 'Meta Developers Community',
                            href: 'https://developers.facebook.com/community?sort=trending&category=766772797555412',
                        },
                    ],
                },
                {
                    title: 'More',
                    items: [
                        {
                            label: 'WhatsApp Business Platform',
                            href: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
                        },
                        {
                            label: 'Meta for Developers',
                            href: 'https://developers.facebook.com/',
                        },
                    ],
                },
            ],
            copyright: `© ${new Date().getFullYear()} Meta Cloud API. Built with Docusaurus.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
