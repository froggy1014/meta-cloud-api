// Real (unmocked) fixtures for the Hono and Fastify adapter tests: a signed
// text-message webhook and an encrypted Flow ping, built with Web Crypto.
import { generateXHub256SigAsync } from '../../utils/generateXHub256Sig';

export const APP_SECRET = 'adapter-app-secret';
export const VERIFY_TOKEN = 'adapter-verify-token';
export const PHONE_NUMBER_ID = 1234567890;

export const baseConfig = {
    accessToken: 'adapter-token',
    phoneNumberId: PHONE_NUMBER_ID,
    appSecret: APP_SECRET,
    webhookVerificationToken: VERIFY_TOKEN,
};

export const textWebhookPayload = {
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
                        contacts: [{ profile: { name: 'Adapter' }, wa_id: '15551234567' }],
                        messages: [
                            { from: '15551234567', id: 'wamid.in', timestamp: '1', type: 'text', text: { body: 'hi' } },
                        ],
                    },
                },
            ],
        },
    ],
};

/** Compact JSON, i.e. what `JSON.stringify(parsedBody)` reproduces. */
export const compactBody = JSON.stringify(textWebhookPayload);

/** Pretty-printed JSON: re-serializing the parsed body does NOT reproduce these bytes. */
export const prettyBody = JSON.stringify(textWebhookPayload, null, 2);

export async function signatureHeader(body: string, secret = APP_SECRET): Promise<string> {
    return `sha256=${await generateXHub256SigAsync(body, secret)}`;
}

export const verifyQuery = (token: string) =>
    `hub.mode=subscribe&hub.verify_token=${encodeURIComponent(token)}&hub.challenge=challenge-123`;

const b64 = {
    encode(bytes: ArrayBuffer | Uint8Array): string {
        let binary = '';
        for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
        return btoa(binary);
    },
    decode(value: string): Uint8Array<ArrayBuffer> {
        return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
    },
};

export interface EncryptedFlowFixture {
    privatePem: string;
    body: string;
    /** Decrypt the base64 Flow response the way Meta does (bit-flipped IV). */
    decryptResponse(responseBody: string): Promise<unknown>;
}

/** Build an RSA key pair and an encrypted Flow `ping` request. */
export async function createEncryptedFlowPing(): Promise<EncryptedFlowFixture> {
    const subtle = globalThis.crypto.subtle;
    const pair = await subtle.generateKey(
        { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true,
        ['encrypt', 'decrypt'],
    );
    const der = b64.encode(await subtle.exportKey('pkcs8', pair.privateKey));
    const privatePem = `-----BEGIN PRIVATE KEY-----\n${der.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----\n`;

    const aesKeyBytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(16));
    const aesKey = await subtle.importKey('raw', aesKeyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
    const flowRequest = { version: '3.0', action: 'ping' };
    const body = JSON.stringify({
        encrypted_aes_key: b64.encode(await subtle.encrypt({ name: 'RSA-OAEP' }, pair.publicKey, aesKeyBytes)),
        encrypted_flow_data: b64.encode(
            await subtle.encrypt(
                { name: 'AES-GCM', iv },
                aesKey,
                new TextEncoder().encode(JSON.stringify(flowRequest)),
            ),
        ),
        initial_vector: b64.encode(iv),
    });

    return {
        privatePem,
        body,
        async decryptResponse(responseBody: string) {
            const flipped = iv.map((byte) => ~byte & 0xff);
            const plain = await subtle.decrypt({ name: 'AES-GCM', iv: flipped }, aesKey, b64.decode(responseBody));
            return JSON.parse(new TextDecoder().decode(plain));
        },
    };
}
