import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://meta-cloud-api.site',
    integrations: [
        react(),
        sitemap(),
        starlight({
            title: 'meta-cloud-api',
            description: 'TypeScript SDK for Meta WhatsApp Cloud API',
            plugins: [
                starlightLlmsTxt({
                    projectName: 'meta-cloud-api',
                }),
            ],
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
                    label: 'Core Concepts',
                    items: [
                        { label: 'Architecture', link: '/core-concepts/architecture' },
                        { label: 'Authentication', link: '/core-concepts/authentication' },
                        { label: 'Error Handling', link: '/core-concepts/error-handling' },
                    ],
                },
                {
                    label: 'API Reference',
                    collapsed: true,
                    items: [
                        {
                            label: 'Messaging',
                            items: [
                                { label: 'Messages', link: '/api/messages' },
                                { label: 'Media', link: '/api/media' },
                                { label: 'Templates', link: '/api/templates' },
                                { label: 'Marketing Messages', link: '/api/marketing-messages' },
                            ],
                        },
                        {
                            label: 'Account',
                            items: [
                                { label: 'Phone Numbers', link: '/api/phone-numbers' },
                                { label: 'Registration', link: '/api/registration' },
                                { label: 'Two-Step Verification', link: '/api/two-step-verification' },
                                { label: 'Business Profile', link: '/api/business-profile' },
                                { label: 'WABA', link: '/api/waba' },
                            ],
                        },
                        {
                            label: 'Advanced',
                            items: [
                                { label: 'Flows', link: '/api/flows' },
                                { label: 'Groups', link: '/api/groups' },
                                { label: 'Calling', link: '/api/calling' },
                                { label: 'QR Codes', link: '/api/qr-codes' },
                                { label: 'Commerce Settings', link: '/api/commerce-settings' },
                                { label: 'Payments', link: '/api/payments' },
                                { label: 'Block Users', link: '/api/block-users' },
                                { label: 'Encryption', link: '/api/encryption' },
                            ],
                        },
                    ],
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
                    label: 'Use Cases',
                    items: [
                        { label: 'Customer Support Bot', link: '/use-cases/customer-support' },
                        { label: 'E-Commerce', link: '/use-cases/ecommerce' },
                        { label: 'Marketing Campaigns', link: '/use-cases/marketing' },
                        { label: 'Appointment Booking', link: '/use-cases/appointment-booking' },
                    ],
                },
                {
                    label: 'Playground',
                    items: [
                        { label: 'Try the SDK', link: 'https://playground.meta-cloud-api.site', attrs: { target: '_blank' } },
                    ],
                },
                {
                    label: 'Type Reference',
                    autogenerate: { directory: 'types' },
                },
            ],
            customCss: ['./src/styles/custom.css'],
            components: {
                Head: './src/components/Head.astro',
                Header: './src/components/Header.astro',
                Hero: './src/components/Hero.astro',
                ThemeProvider: './src/components/ThemeProvider.astro',
            },
        }),
    ],
});
