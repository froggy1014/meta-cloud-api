import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { webhook } from '@/lib/webhook';
import { config, isMock, MOCK_DISPLAY_NUMBER } from '@/lib/whatsapp';

export const runtime = 'nodejs';

/**
 * Mock mode only. Wraps the customer's text in the exact JSON Meta sends to
 * your webhook and runs it through the SDK. Your bot cannot tell the
 * difference, which is the point.
 */
export async function POST(request: Request): Promise<Response> {
    if (!isMock) return Response.json({ error: 'Simulator is only available in mock mode' }, { status: 404 });

    const {
        from = '15550001111',
        name = 'Test Customer',
        text,
    } = (await request.json()) as {
        from?: string;
        name?: string;
        text?: string;
    };
    if (!text?.trim()) return Response.json({ error: 'text is required' }, { status: 400 });

    const payload = {
        object: 'whatsapp_business_account',
        entry: [
            {
                id: config.businessAcctId,
                changes: [
                    {
                        field: 'messages',
                        value: {
                            messaging_product: 'whatsapp',
                            metadata: {
                                display_phone_number: MOCK_DISPLAY_NUMBER.replace(/\D/g, ''),
                                phone_number_id: String(config.phoneNumberId),
                            },
                            contacts: [{ profile: { name }, wa_id: from }],
                            messages: [
                                {
                                    from,
                                    id: `wamid.mock.${randomUUID()}`,
                                    timestamp: String(Math.floor(Date.now() / 1000)),
                                    type: 'text',
                                    text: { body: text },
                                },
                            ],
                        },
                    },
                ],
            },
        ],
    };

    const res = await webhook.POST(
        new NextRequest(new URL('/api/webhook', request.url), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
        }),
    );
    return Response.json({ ok: res.ok, webhookStatus: res.status, payload });
}
