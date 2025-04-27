import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: 'Meta Cloud API',
    tagline: 'Build powerful WhatsApp integrations',
    favicon: 'img/favicon.ico',

    url: `https://${process.env.VERCEL_URL}`,
    baseUrl: '/',

    organizationName: 'meta-cloud-api',
    projectName: 'meta-cloud-api',

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

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
                    editUrl: 'https://github.com/froggy1014/meta-cloud-api',
                },
                theme: {
                    customCss: './src/css/custom.css',
                },
                sitemap: {
                    changefreq: 'weekly',
                    priority: 0.5,
                    ignorePatterns: ['/tags/**'],
                    filename: 'sitemap.xml',
                },
            } satisfies Preset.Options,
        ],
    ],
    headTags: [
        {
            tagName: 'script',
            attributes: {
                type: 'application/ld+json',
            },
            innerHTML: JSON.stringify({
                '@context': 'https://schema.org/',
                '@type': 'Organization',
                name: 'Meta Cloud API',
                url: 'https://www.meta-cloud-api.xyz/',
                logo: 'https://www.meta-cloud-api.xyz/img/logo.svg',
            }),
        },
        {
            tagName: 'link',
            attributes: {
                rel: 'preconnect',
                href: 'https://example.com',
            },
        },
    ],

    themeConfig: {
        colorMode: {
            defaultMode: 'dark',
            disableSwitch: true,
        },
        navbar: {
            title: 'Meta Cloud API',
            logo: {
                alt: 'Meta Cloud API Logo',
                src: 'img/logo.svg',
            },
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'docsSidebar',
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
        metadata: [
            { name: 'keywords', content: 'meta, whatsapp, api, cloud, integration, messaging' },
            { name: 'og:title', content: 'Meta Cloud API' },
            { name: 'og:description', content: 'Build powerful WhatsApp integrations' },
            { name: 'og:type', content: 'website' },
            { name: 'og:image', content: '/img/meta-cloud-api-social.png' },
            { name: 'og:url', content: 'https://www.meta-cloud-api.xyz' },
        ],
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
