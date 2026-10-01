import { randomUUID } from 'node:crypto';
import { WhatsApp } from 'meta-cloud-api';
import { addMessage, updateStatus } from './store';

/**
 * Mock mode: no credentials in .env.local. Incoming messages come from the
 * "customer" box in the browser, sent as real Cloud API webhook payloads, so
 * the SDK parses them exactly like production. Outgoing messages are stored
 * instead of sent to Meta.
 */
export const isMock = !process.env.CLOUD_API_ACCESS_TOKEN || !process.env.WA_PHONE_NUMBER_ID;

export const MOCK_PHONE_NUMBER_ID = '100000000000001';
export const MOCK_DISPLAY_NUMBER = '+1 555 010 0000';

export const config = {
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN || 'mock-token',
    phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID || MOCK_PHONE_NUMBER_ID),
    businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID || 'mock-waba',
    webhookVerificationToken: process.env.WEBHOOK_VERIFICATION_TOKEN || 'dev-verify-token',
};

let client: WhatsApp | null = null;
function wa(): WhatsApp {
    if (!client) client = new WhatsApp(config);
    return client;
}

/** Send a text message and record it in the chat. Works the same in both modes. */
export async function sendText(to: string, body: string): Promise<{ id: string }> {
    if (isMock) {
        const id = `wamid.mock.${randomUUID()}`;
        addMessage({ id, contact: to, direction: 'out', text: body, at: Date.now(), status: 'sent' });
        // Pretend WhatsApp delivered and the customer read it.
        setTimeout(() => updateStatus(id, 'delivered'), 400);
        setTimeout(() => updateStatus(id, 'read'), 1200);
        return { id };
    }

    const pendingId = `pending.${randomUUID()}`;
    try {
        const res = await wa().messages.text({ to, body });
        const id = res.messages?.[0]?.id ?? pendingId;
        addMessage({ id, contact: to, direction: 'out', text: body, at: Date.now(), status: 'sent' });
        return { id };
    } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        addMessage({
            id: pendingId,
            contact: to,
            direction: 'out',
            text: body,
            at: Date.now(),
            status: 'failed',
            error,
        });
        throw err;
    }
}
