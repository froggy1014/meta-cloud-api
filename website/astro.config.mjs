import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://meta-cloud-api.xyz',
    integrations: [
        starlight({
            title: 'meta-cloud-api',
            description: 'TypeScript SDK wrapper for Meta WhatsApp Cloud API',
            logo: {
                src: './public/logo.svg',
            },
            favicon: '/favicon.ico',
            social: {
                github: 'https://github.com/froggy1014/meta-cloud-api',
            },
            editLink: {
                baseUrl: 'https://github.com/froggy1014/meta-cloud-api/edit/main/website/',
            },
            sidebar: [
                {
                    label: 'Getting Started',
                    items: [
                        { label: 'Introduction', link: '/getting-started/introduction' },
                        { label: 'Installation', link: '/getting-started/installation' },
                        { label: 'Quick Start', link: '/getting-started/quick-start' },
                        { label: 'Configuration', link: '/getting-started/configuration' },
                    ],
                },
                {
                    label: 'API Reference',
                    autogenerate: { directory: 'api' },
                },
                {
                    label: 'Webhooks',
                    autogenerate: { directory: 'webhooks' },
                },
                {
                    label: 'Framework Guides',
                    autogenerate: { directory: 'guides' },
                },
                {
                    label: 'Type Reference',
                    autogenerate: { directory: 'types' },
                },
            ],
            customCss: ['./src/styles/custom.css'],
            components: {
                Head: './src/components/Head.astro',
            },
        }),
    ],
});
