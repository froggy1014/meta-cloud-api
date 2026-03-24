import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'meta-cloud-api Demo',
    description: 'Interactive WhatsApp Cloud API demo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen bg-zinc-900 text-zinc-50 antialiased">{children}</body>
        </html>
    );
}
