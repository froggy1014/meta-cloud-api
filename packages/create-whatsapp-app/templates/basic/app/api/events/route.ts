import { snapshot, subscribe } from '@/lib/store';
import { isMock, MOCK_DISPLAY_NUMBER } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Server-Sent Events: full snapshot first, then every change. */
export async function GET(request: Request): Promise<Response> {
    const encoder = new TextEncoder();
    let cleanup = () => {};

    const stream = new ReadableStream({
        start(controller) {
            const send = (event: string, data: unknown) =>
                controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));

            send('snapshot', {
                ...snapshot(),
                mode: isMock ? 'mock' : 'live',
                businessNumber: isMock ? MOCK_DISPLAY_NUMBER : null,
            });
            const unsubscribe = subscribe((e) => send('change', e));
            const ping = setInterval(() => controller.enqueue(encoder.encode(': ping\n\n')), 15_000);
            cleanup = () => {
                clearInterval(ping);
                unsubscribe();
            };
            request.signal.addEventListener('abort', () => {
                cleanup();
                try {
                    controller.close();
                } catch {
                    // already closed
                }
            });
        },
        cancel() {
            cleanup();
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
        },
    });
}
