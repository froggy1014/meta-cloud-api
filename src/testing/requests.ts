// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview
import { generateXHub256SigAsync, type WebhookPayload } from './sdk';

/** Default URL for requests built by the testing helpers. */
export const TEST_WEBHOOK_URL = 'https://localhost/webhook';

export interface SignedWebhookRequestOptions {
    /** App Secret used for the `X-Hub-Signature-256` HMAC (the same one the processor is configured with). */
    appSecret: string;
    /** Request URL. Defaults to {@link TEST_WEBHOOK_URL}. */
    url?: string;
    /** Extra headers. They can override the defaults, e.g. to send a broken signature. */
    headers?: Record<string, string>;
}

/**
 * Build the `POST` Meta sends to your webhook, signed with `appSecret` the way
 * Meta signs it. Pass the result to `processor.processWebhook(request)` or to
 * your framework route handler. Strings are sent unchanged; anything else is
 * serialized with `JSON.stringify`.
 */
export async function createSignedWebhookRequest(
    payload: WebhookPayload | string,
    options: SignedWebhookRequestOptions,
): Promise<Request> {
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const signature = await generateXHub256SigAsync(body, options.appSecret);
    const headers = new Headers({
        'content-type': 'application/json',
        'x-hub-signature-256': `sha256=${signature}`,
    });
    for (const [name, value] of Object.entries(options.headers ?? {})) headers.set(name, value);
    return new Request(options.url ?? TEST_WEBHOOK_URL, { method: 'POST', body, headers });
}
