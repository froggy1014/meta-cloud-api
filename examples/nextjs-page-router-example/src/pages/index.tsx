import Head from 'next/head';

export default function Home() {
    return (
        <>
            <Head>
                <title>WhatsApp Bot - Builder Pattern Example</title>
                <meta name="description" content="WhatsApp Cloud API Bot using Builder Pattern" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            🤖 WhatsApp Bot - Builder Pattern Example
                        </h1>
                        <p className="text-gray-600 mb-8">
                            This example demonstrates how to use the Builder Pattern with WhatsApp Cloud API
                        </p>

                        <div className="space-y-6">
                            <section>
                                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                                    📱 Available Message Handlers
                                </h2>
                                <div className="bg-gray-50 rounded p-4">
                                    <p className="text-sm text-gray-700 mb-3">
                                        The webhook API route has handlers for different message types. Edit{' '}
                                        <code className="bg-gray-200 px-2 py-1 rounded text-sm">/api/webhook.ts</code>{' '}
                                        and uncomment the handlers you want to use:
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <code className="bg-green-100 px-2 py-1 rounded">Text Messages</code>
                                            <span className="text-gray-500 ml-2">(Enabled by default)</span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="text-gray-400 mr-2">○</span>
                                            <code className="bg-gray-100 px-2 py-1 rounded">Image Messages</code>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="text-gray-400 mr-2">○</span>
                                            <code className="bg-gray-100 px-2 py-1 rounded">Document Messages</code>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="text-gray-400 mr-2">○</span>
                                            <code className="bg-gray-100 px-2 py-1 rounded">Contact Messages</code>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="text-gray-400 mr-2">○</span>
                                            <code className="bg-gray-100 px-2 py-1 rounded">Location Messages</code>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="text-gray-400 mr-2">○</span>
                                            <code className="bg-gray-100 px-2 py-1 rounded">Interactive Messages</code>
                                        </li>
                                    </ul>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
