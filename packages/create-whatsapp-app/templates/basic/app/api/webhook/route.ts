import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest } from 'next/server';
import { webhook } from '@/lib/webhook';
import { isMock } from '@/lib/whatsapp';

export const runtime = 'nodejs';

// GET: Meta's one-time verification handshake (hub.challenge).
export const GET = webhook.GET;

// POST: incoming messages and delivery statuses.
export async function POST(request: Request): Promise<Response> {
    const raw = await request.text();
    const appSecret = process.env.APP_SECRET;

    if (!isMock && !appSecret) {
        return new Response('Webhook signature verification is not configured', { status: 503 });
    }

    if (appSecret) {
        const expected = Buffer.from(`sha256=${createHmac('sha256', appSecret).update(raw).digest('hex')}`);
        const actual = Buffer.from(request.headers.get('x-hub-signature-256') ?? '');
        if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
            return new Response('Invalid signature', { status: 401 });
        }
    }

    return webhook.POST(new NextRequest(request.url, { method: 'POST', headers: request.headers, body: raw }));
}
