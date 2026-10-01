// Runtime smoke test for the built SDK (dist/). It uses only Web APIs so the
// same file runs on Node.js, Bun, Deno and Cloudflare workerd. Each runner
// imports `runSmoke` and fails when it throws.
import {
    FlowTypeEnum,
    WebhookProcessor,
    WhatsApp,
    canSendFreeformMessage,
    generateXHub256SigAsync,
    honoWebhookHandler,
} from '../../dist/index.mjs';

const APP_SECRET = 'smoke-app-secret';
const PHONE_NUMBER_ID = 1234567890;

function assert(condition, message) {
    if (!condition) throw new Error(`Smoke assertion failed: ${message}`);
}

const b64 = {
    encode(bytes) {
        let binary = '';
        for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
        return btoa(binary);
    },
    decode(value) {
        return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
    },
};

async function checkClient() {
    const calls = [];
    const realFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
        calls.push({ url: String(url), init });
        return new Response(JSON.stringify({ messaging_product: 'whatsapp', messages: [{ id: 'wamid.smoke' }] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    };
    try {
        const wa = new WhatsApp({ accessToken: 'smoke-token', phoneNumberId: PHONE_NUMBER_ID });
        assert(!wa.version().includes('unknown'), `version() is "${wa.version()}"`);
        assert(!wa.getUserAgent().includes('unknown'), `User-Agent is "${wa.getUserAgent()}"`);

        const result = await wa.messages.text({ to: '15551234567', body: 'hello from the smoke test' });
        assert(result.messages?.[0]?.id === 'wamid.smoke', 'text() returns the API response');
        assert(calls.length === 1, `expected 1 fetch call, got ${calls.length}`);
        const { url, init } = calls[0];
        assert(url.startsWith('https://graph.facebook.com/') && url.endsWith(`/${PHONE_NUMBER_ID}/messages`), url);
        const headers = new Headers(init.headers);
        assert(headers.get('authorization') === 'Bearer smoke-token', 'Authorization header');
        const sent = JSON.parse(init.body);
        assert(sent.type === 'text' && sent.text.body === 'hello from the smoke test', 'request payload');
        return wa.getUserAgent();
    } finally {
        globalThis.fetch = realFetch;
    }
}

async function checkWebhook() {
    const processor = new WebhookProcessor({
        accessToken: 'smoke-token',
        phoneNumberId: PHONE_NUMBER_ID,
        appSecret: APP_SECRET,
        verifyWebhookSignature: true,
    });
    const received = [];
    processor.onText((_wa, processed) => {
        received.push(processed.message.text.body);
    });

    const body = JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [
            {
                id: 'WABA_ID',
                changes: [
                    {
                        field: 'messages',
                        value: {
                            messaging_product: 'whatsapp',
                            metadata: { display_phone_number: '15550000000', phone_number_id: String(PHONE_NUMBER_ID) },
                            contacts: [{ profile: { name: 'Smoke' }, wa_id: '15551234567' }],
                            messages: [
                                { from: '15551234567', id: 'wamid.in', timestamp: '1', type: 'text', text: { body: 'hi' } },
                            ],
                        },
                    },
                ],
            },
        ],
    });
    const signature = await generateXHub256SigAsync(body, APP_SECRET);
    const post = (sig) =>
        processor.processWebhook(
            new Request('https://example.com/webhook', {
                method: 'POST',
                body,
                headers: { 'content-type': 'application/json', 'x-hub-signature-256': `sha256=${sig}` },
            }),
        );

    const ok = await post(signature);
    assert(ok.status === 200, `signed webhook status ${ok.status} ${ok.body}`);
    assert(received.length === 1 && received[0] === 'hi', 'onText handler ran once with the message');

    const bad = await post('0'.repeat(64));
    assert(bad.status === 401, `bad signature status ${bad.status}`);
    assert(received.length === 1, 'handler did not run for a bad signature');
}

// The Hono adapter only touches `c.req.raw`, so a minimal context object proves
// it on every runtime without importing hono.
async function checkHonoAdapter() {
    const wa = honoWebhookHandler({
        accessToken: 'smoke-token',
        phoneNumberId: PHONE_NUMBER_ID + 1,
        appSecret: APP_SECRET,
        webhookVerificationToken: 'smoke-verify',
        verifyWebhookSignature: true,
    });
    const received = [];
    wa.processor.onText((_wa, processed) => {
        received.push(processed.message.text.body);
    });
    const context = (request) => ({ req: { raw: request } });

    try {
        const verify = await wa.GET(
            context(
                new Request('https://example.com/webhook?hub.mode=subscribe&hub.verify_token=smoke-verify&hub.challenge=c1'),
            ),
        );
        assert(verify.status === 200 && (await verify.text()) === 'c1', `hono GET status ${verify.status}`);

        const body = JSON.stringify({
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: 'WABA_ID',
                    changes: [
                        {
                            field: 'messages',
                            value: {
                                messaging_product: 'whatsapp',
                                metadata: { display_phone_number: '1', phone_number_id: String(PHONE_NUMBER_ID + 1) },
                                messages: [{ from: '1', id: 'wamid.hono', timestamp: '1', type: 'text', text: { body: 'hono' } }],
                            },
                        },
                    ],
                },
            ],
        });
        const post = async (sig) =>
            wa.webhook(
                context(
                    new Request('https://example.com/webhook', {
                        method: 'POST',
                        body,
                        headers: { 'content-type': 'application/json', 'x-hub-signature-256': `sha256=${sig}` },
                    }),
                ),
            );
        const ok = await post(await generateXHub256SigAsync(body, APP_SECRET));
        assert(ok.status === 200, `hono POST status ${ok.status}`);
        assert(received.length === 1 && received[0] === 'hono', 'hono onText handler ran once');
        const bad = await post('0'.repeat(64));
        assert(bad.status === 401 && received.length === 1, `hono bad signature status ${bad.status}`);
    } finally {
        wa.destroy();
    }
}

async function checkMediaAndRateLimits() {
    const calls = [];
    const realFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
        calls.push({ url: String(url), init });
        return new Response('{"id":"media.smoke"}', {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'x-business-use-case-usage':
                    '{"102290129340398":[{"type":"whatsapp","call_count":42,"total_cputime":1,"total_time":1,"estimated_time_to_regain_access":0}]}',
            },
        });
    };
    try {
        const wa = new WhatsApp({ accessToken: 'smoke-token', phoneNumberId: PHONE_NUMBER_ID });
        const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(bytes.subarray(0, 2));
                controller.enqueue(bytes.subarray(2));
                controller.close();
            },
        });
        const inputs = [stream, bytes, bytes.buffer, new Blob([bytes], { type: 'image/png' })];
        for (const input of inputs) {
            const result = await wa.media.uploadMedia(input, { type: 'image/png', filename: 'smoke.png' });
            assert(result.id === 'media.smoke', 'uploadMedia returns the API response');
        }
        assert(calls.length === inputs.length, `expected ${inputs.length} uploads, got ${calls.length}`);
        for (const { url, init } of calls) {
            assert(url.endsWith(`/${PHONE_NUMBER_ID}/media`), url);
            const file = init.body.get('file');
            const sent = new Uint8Array(await file.arrayBuffer());
            assert(sent.length === 4 && sent[0] === 0x89 && sent[3] === 0x47, 'uploaded bytes');
            assert(init.body.get('type') === 'image/png', 'type field');
        }
        assert(wa.getLastRateLimitInfo()?.maxUsagePercent === 42, 'rate limit headers parsed');
        assert(canSendFreeformMessage(String(Math.floor(Date.now() / 1000) - 60)), 'customer service window open');
    } finally {
        globalThis.fetch = realFetch;
    }
}

function toPem(label, der) {
    const lines = b64.encode(der).match(/.{1,64}/g).join('\n');
    return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----\n`;
}

async function checkFlow() {
    const subtle = globalThis.crypto.subtle;
    const pair = await subtle.generateKey(
        { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true,
        ['encrypt', 'decrypt'],
    );
    const privatePem = toPem('PRIVATE KEY', await subtle.exportKey('pkcs8', pair.privateKey));

    const processor = new WebhookProcessor({
        accessToken: 'smoke-token',
        phoneNumberId: PHONE_NUMBER_ID,
        appSecret: APP_SECRET,
        privatePem,
    });
    processor.onFlow(FlowTypeEnum.Change, (_wa, request) => ({
        screen: 'SUCCESS',
        data: { echoed: request.data.name },
    }));

    // Encrypt the request the way Meta does.
    const aesKeyBytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(16));
    const aesKey = await subtle.importKey('raw', aesKeyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
    const flowRequest = { version: '3.0', action: 'data_exchange', screen: 'START', data: { name: 'Zoë' }, flow_token: 't' };
    const body = JSON.stringify({
        encrypted_aes_key: b64.encode(await subtle.encrypt({ name: 'RSA-OAEP' }, pair.publicKey, aesKeyBytes)),
        encrypted_flow_data: b64.encode(
            await subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, new TextEncoder().encode(JSON.stringify(flowRequest))),
        ),
        initial_vector: b64.encode(iv),
    });

    const response = await processor.processFlow(
        new Request('https://example.com/flow', {
            method: 'POST',
            body,
            headers: { 'x-hub-signature-256': `sha256=${await generateXHub256SigAsync(body, APP_SECRET)}` },
        }),
    );
    assert(response.status === 200, `flow status ${response.status} ${response.body}`);

    // Decrypt the response the way Meta does (bit-flipped IV).
    const flipped = iv.map((byte) => ~byte & 0xff);
    const plain = await subtle.decrypt({ name: 'AES-GCM', iv: flipped }, aesKey, b64.decode(response.body));
    const decoded = JSON.parse(new TextDecoder().decode(plain));
    assert(decoded.screen === 'SUCCESS' && decoded.data.echoed === 'Zoë', `flow response ${JSON.stringify(decoded)}`);
}

export async function runSmoke() {
    const userAgent = await checkClient();
    await checkWebhook();
    await checkHonoAdapter();
    await checkFlow();
    await checkMediaAndRateLimits();
    return `ok: client, signed webhook, hono adapter, encrypted flow, media upload (${userAgent})`;
}
