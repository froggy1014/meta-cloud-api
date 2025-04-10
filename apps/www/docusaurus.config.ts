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

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl: 'https://github.com/meta-cloud-api/meta-cloud-api/tree/main/apps/www/',
                },
                blog: {
                    showReadingTime: true,
                    feedOptions: {
                        type: ['rss', 'atom'],
                        xslt: true,
                    },
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl: 'https://github.com/meta-cloud-api/meta-cloud-api/tree/main/apps/www/',
                    // Useful options to enforce blogging best practices
                    onInlineTags: 'warn',
                    onInlineAuthors: 'warn',
                    onUntruncatedBlogPosts: 'warn',
                },
                theme: {
                    customCss: './src/css/custom.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        image: 'img/docusaurus-social-card.jpg',
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
                { to: '/blog', label: 'Blog', position: 'left' },
                {
                    href: 'https://github.com/meta-cloud-api/meta-cloud-api',
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
                        {
                            label: 'Messages API',
                            to: '/docs/messages',
                        },
                        {
                            label: 'Template API',
                            to: '/docs/template-api',
                        },
                        {
                            label: 'Phone Number API',
                            to: '/docs/phone-number-api',
                        },
                        {
                            label: 'QR Code API',
                            to: '/docs/qr-code-api',
                        },
                        {
                            label: 'Encryption API',
                            to: '/docs/encryption-api',
                        },
                        {
                            label: 'Two-Step Verification API',
                            to: '/docs/two-step-verification-api',
                        },
                        {
                            label: 'Registration API',
                            to: '/docs/registration-api',
                        },
                        {
                            label: 'Media API',
                            to: '/docs/media-api',
                        },
                        {
                            label: 'WABA API',
                            to: '/docs/waba-api',
                        },
                        {
                            label: 'Flow API',
                            to: '/docs/flow-api',
                        },
                    ],
                },
                {
                    title: 'Community',
                    items: [
                        {
                            label: 'Stack Overflow',
                            href: 'https://stackoverflow.com/questions/tagged/meta-cloud-api',
                        },
                    ],
                },
                {
                    title: 'More',
                    items: [
                        {
                            label: 'Blog',
                            to: '/blog',
                        },
                        {
                            label: 'GitHub',
                            href: 'https://github.com/meta-cloud-api/meta-cloud-api',
                        },
                        {
                            label: 'WhatsApp Business Platform',
                            href: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Meta Cloud API. Built with Docusaurus.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
