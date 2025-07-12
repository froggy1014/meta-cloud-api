import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export default function Home() {
    return (
        <div
            className={`${geistSans.className} ${geistMono.className} grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20`}
        >
            <main className="row-start-2 flex flex-col items-center gap-[32px] sm:items-start">
                <div className="flex flex-col items-center gap-4">
                    <h1 className="text-4xl font-bold text-center">WhatsApp Echo Bot</h1>
                    <p className="text-lg text-center text-gray-600 dark:text-gray-300">
                        A simple echo bot built with Next.js and Meta Cloud API
                    </p>
                </div>

                <div className="w-full max-w-[600px] rounded-lg border border-solid border-black/[.08] p-6 dark:border-white/[.145]">
                    <h2 className="mb-4 text-xl font-bold">How it works</h2>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💬</span>
                            <div>
                                <p className="font-medium">Text Messages</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Send any text message and the bot will echo it back with "Echo: " prefix
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📷</span>
                            <div>
                                <p className="font-medium">Media Messages</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Send images, documents, audio, video, stickers, locations, or contacts
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">✅</span>
                            <div>
                                <p className="font-medium">Read Receipts</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    All messages are automatically marked as read
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-[600px] rounded-lg border border-solid border-black/[.08] p-6 dark:border-white/[.145]">
                    <h2 className="mb-4 text-xl font-bold">Example Interactions</h2>
                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">You send:</p>
                            <p className="font-mono">"Hello World!"</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                            <p className="text-sm text-blue-600 dark:text-blue-300 mb-1">Bot responds:</p>
                            <p className="font-mono">"Echo: Hello World!"</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">You send:</p>
                            <p className="font-mono">[Image]</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                            <p className="text-sm text-blue-600 dark:text-blue-300 mb-1">Bot responds:</p>
                            <p className="font-mono">"Echo: I received your image!"</p>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-[600px] rounded-lg border border-solid border-black/[.08] p-6 dark:border-white/[.145]">
                    <h2 className="mb-4 text-xl font-bold">Getting Started</h2>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>
                            Configure your environment variables in{' '}
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">.env.local</code>
                        </li>
                        <li>
                            Start the development server with{' '}
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">npm run dev</code>
                        </li>
                        <li>
                            Use ngrok to expose your local server:{' '}
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">ngrok http 3000</code>
                        </li>
                        <li>Configure your webhook URL in Meta Developer Dashboard</li>
                        <li>Start sending messages to your WhatsApp Business number!</li>
                    </ol>
                </div>

                <div className="flex gap-4">
                    <a
                        className="flex h-10 items-center justify-center rounded-full border border-solid border-black/[.08] px-4 text-sm font-medium transition-colors hover:border-transparent hover:bg-[#f2f2f2] sm:h-12 sm:px-5 sm:text-base dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
                        href="https://www.meta-cloud-api.xyz/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Visit Meta Cloud API
                    </a>
                    <a
                        className="flex h-10 items-center justify-center rounded-full border border-solid border-black/[.08] px-4 text-sm font-medium transition-colors hover:border-transparent hover:bg-[#f2f2f2] sm:h-12 sm:px-5 sm:text-base dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
                        href="https://github.com/froggy1014/meta-cloud-api/tree/main/examples/nextjs-page-router-example"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View Source Code
                    </a>
                </div>
            </main>
            <footer className="row-start-3 flex flex-wrap items-center justify-center gap-[24px]">
                <a
                    className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                    href="https://github.com/froggy1014/meta-cloud-api"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                    Contribute
                </a>
            </footer>
        </div>
    );
}
