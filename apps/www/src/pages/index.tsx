import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import Heading from '@theme/Heading';

import styles from './index.module.css';
import { Button } from '@repo/ui/button';
import FeatureCard from '../components/feature-card';
import HeroScene from '../components/hero-scene';
import { ArrowRight } from 'lucide-react';

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={clsx('hero hero--primary', styles.heroBanner)}>
            <div className="container">
                <Heading as="h1" className="hero__title">
                    {siteConfig.title}
                </Heading>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
                <div className={styles.buttons}>
                    <Link className="button button--secondary button--lg" to="/docs/intro">
                        Get Started
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default function Home(): ReactNode {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`${siteConfig.title} - ${siteConfig.tagline}`}
            description="Meta Cloud API - Build powerful WhatsApp integrations with ease"
        >
            <section className="relative h-[50vh] w-full overflow-hidden">
                <HeroScene />
            </section>

            <section className="w-full bg-[#0B101D] px-4 py-20 md:px-6">
                <h2 className="text-5xl! py-10 text-center font-bold md:text-4xl">Powerful Features for Developers</h2>

                <div className="grid gap-8 md:grid-cols-3">
                    <FeatureCard
                        title="Easy Integration"
                        description="Meta Cloud API is designed to be easy to integrate with your existing Node.js applications, with a clean and intuitive TypeScript interface."
                        icon="Integration"
                    />
                    <FeatureCard
                        title="Rich Messaging Capabilities"
                        description="From simple text to interactive buttons, templates, media sharing and more - build rich conversational experiences with WhatsApp."
                        icon="Messaging"
                    />
                    <FeatureCard
                        title="Type-Safe Development"
                        description="Built with TypeScript to provide code completion, parameter validation, and to catch errors during development - not at runtime."
                        icon="Development"
                    />
                </div>
            </section>

            <section className="bg-[#131927] px-4 py-10 backdrop-blur-sm md:px-6">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-5xl! mb-8 text-center font-bold text-white md:text-4xl">
                        Comprehensive API Documentation
                    </h2>
                    <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-xl">
                        <div className="mb-4 flex items-center">
                            <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
                            <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500"></div>
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            <div className="ml-4 text-sm text-gray-400">meta-cloud-api.ts</div>
                        </div>
                        <pre className="overflow-x-auto text-sm text-green-400">
                            <code className="text-green-400">{`import { MetaCloudAPI } from 'meta-cloud-api';

// Initialize the client
const client = new MetaCloudAPI({
  apiKey: process.env.META_API_KEY,
  version: 'v1'
});

// Send a WhatsApp message
const response = await client.messages.send({
  to: '+1234567890',
  type: 'text',
  text: {
    body: 'Hello from Meta Cloud API!'
  }
});

console.log(response);`}</code>
                        </pre>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
