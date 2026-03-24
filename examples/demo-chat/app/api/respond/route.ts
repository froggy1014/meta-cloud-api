export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from 'next/server';
import { addMessage, getSession } from '@/lib/event-store';
import { PREDEFINED_RESPONSES } from '@/lib/predefined-responses';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { getSDK } from '@/lib/sdk';

type SDK = ReturnType<typeof getSDK>;
type SendResult = { result: unknown; sdkCode: string };

// Each message type handler: takes SDK, recipient, payload → returns result + SDK code
const MESSAGE_HANDLERS: Record<
    string,
    (sdk: SDK, to: string, p: Record<string, unknown>, lastMessageId?: string) => Promise<SendResult>
> = {
    text: async (sdk, to, p) => {
        const args = { to, body: p.body as string };
        return { result: await sdk.messages.text(args), sdkCode: fmt('text', args) };
    },
    image: async (sdk, to, p) => {
        const args = { to, body: { link: p.link as string, caption: p.caption as string } };
        return { result: await sdk.messages.image(args), sdkCode: fmt('image', args) };
    },
    video: async (sdk, to, p) => {
        const args = { to, body: { link: p.link as string, caption: p.caption as string } };
        return { result: await sdk.messages.video(args), sdkCode: fmt('video', args) };
    },
    document: async (sdk, to, p) => {
        const args = {
            to,
            body: { link: p.link as string, filename: p.filename as string, caption: p.caption as string },
        };
        return { result: await sdk.messages.document(args), sdkCode: fmt('document', args) };
    },
    interactive_buttons: async (sdk, to, p) => {
        const args = {
            to,
            body: { type: 'button' as const, body: { text: p.body as string }, action: { buttons: p.buttons } },
        };
        return {
            result: await (sdk.messages as any).interactiveReplyButtons(args),
            sdkCode: fmt('interactiveReplyButtons', args),
        };
    },
    interactive_list: async (sdk, to, p) => {
        const args = {
            to,
            body: {
                type: 'list' as const,
                body: { text: p.body as string },
                action: { button: p.buttonText as string, sections: p.sections },
            },
        };
        return { result: await (sdk.messages as any).interactiveList(args), sdkCode: fmt('interactiveList', args) };
    },
    cta_url: async (sdk, to, p) => {
        const args = {
            to,
            body: {
                type: 'cta_url' as const,
                body: { text: p.body as string },
                action: {
                    name: 'cta_url' as const,
                    parameters: { display_text: p.displayText as string, url: p.url as string },
                },
            },
        };
        return { result: await (sdk.messages as any).interactiveCtaUrl(args), sdkCode: fmt('interactiveCtaUrl', args) };
    },
    location: async (sdk, to, p) => {
        const args = {
            to,
            body: {
                longitude: p.longitude as number,
                latitude: p.latitude as number,
                name: p.name as string,
                address: p.address as string,
            },
        };
        return { result: await sdk.messages.location(args), sdkCode: fmt('location', args) };
    },
    contacts: async (sdk, to, p) => {
        const args = {
            to,
            body: [
                {
                    name: { formatted_name: p.contactName as string, first_name: p.contactName as string },
                    phones: [{ phone: p.contactPhone as string, type: 'MOBILE' as const }],
                },
            ],
        };
        return { result: await sdk.messages.contacts(args), sdkCode: fmt('contacts', args) };
    },
    reaction: async (sdk, to, p, lastMessageId) => {
        if (!lastMessageId) throw new Error('No message to react to');
        const args = { to, messageId: lastMessageId, emoji: p.emoji as string };
        return { result: await sdk.messages.reaction(args), sdkCode: fmt('reaction', args) };
    },
    template: async (sdk, to, p) => {
        const args = {
            to,
            body: {
                name: p.name as string,
                language: { policy: 'deterministic' as const, code: p.language as string },
            },
        };
        return { result: await sdk.messages.template(args), sdkCode: fmt('template', args) };
    },
    flow: async (sdk, to, p) => {
        const args = {
            to,
            body: {
                type: 'flow' as const,
                body: { text: p.body as string },
                action: {
                    name: 'flow' as const,
                    parameters: {
                        flow_message_version: '3',
                        flow_id: p.flowId as string,
                        flow_cta: p.flowCta as string,
                        mode: 'draft' as const,
                    },
                },
            },
        };
        return { result: await (sdk.messages as any).interactiveFlow(args), sdkCode: fmt('interactiveFlow', args) };
    },
    mark_as_read: async (sdk, _to, _p, lastMessageId) => {
        if (!lastMessageId) throw new Error('No message to mark as read');
        const args = { messageId: lastMessageId };
        return { result: await sdk.messages.markAsRead(args), sdkCode: fmt('markAsRead', args) };
    },
};

function fmt(method: string, args: Record<string, unknown>): string {
    return `sdk.messages.${method}(${JSON.stringify(args, null, 2)})`;
}

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request);
        if (!checkRateLimit(ip)) {
            return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
        }

        const { sessionId, responseId, lastMessageId } = await request.json();
        if (!sessionId || !responseId) {
            return NextResponse.json({ error: 'sessionId and responseId required' }, { status: 400 });
        }

        const session = await getSession(sessionId);
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const response = PREDEFINED_RESPONSES.find((r) => r.id === responseId);
        if (!response) {
            return NextResponse.json({ error: 'Unknown response' }, { status: 400 });
        }

        // 24h window check
        if (new Date(session.window_expires_at) < new Date() && response.requiresWindow) {
            return NextResponse.json({ error: '24h window expired. Only template messages allowed.' }, { status: 403 });
        }

        const handler = MESSAGE_HANDLERS[response.type];
        if (!handler) {
            return NextResponse.json({ error: `Unsupported type: ${response.type}` }, { status: 400 });
        }

        const to = session.phone_number;
        const { result, sdkCode } = await handler(getSDK(), to, response.payload, lastMessageId);

        // Store sent message
        const waMessageId = (result as any)?.messages?.[0]?.id;
        if (waMessageId) {
            await addMessage({
                waMessageId,
                direction: 'sent',
                toNumber: to,
                type: response.type,
                content: { label: response.label, ...response.payload },
                status: 'sent',
                sessionId,
            });
        }

        return NextResponse.json({ ...(result as object), sdkCode });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[respond]', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
