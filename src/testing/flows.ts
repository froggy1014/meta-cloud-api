// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/flows/guides/implementingyourflowendpoint
import { base64ToBytes, bytesToBase64, utf8Decode, utf8Encode } from '../utils/runtime';
import type { FlowActionEnum, FlowDataExchangeResponse } from './sdk';
import { generateXHub256SigAsync } from './sdk';

/** Default URL for Flow endpoint requests built by {@link createFlowRequest}. */
export const TEST_FLOW_URL = 'https://localhost/flow';

/** The decrypted request body Meta sends to a Flow endpoint. */
export interface FlowRequestInit {
    /** Defaults to `'3.0'`. */
    version?: '3.0';
    /** Defaults to `'data_exchange'`. */
    action?: 'ping' | `${FlowActionEnum}`;
    screen?: string;
    /** Defaults to `'test-flow-token'` (not added to `ping` requests). */
    flow_token?: string;
    data?: Record<string, unknown>;
}

export interface FlowRequestOptions {
    /**
     * Your Flow endpoint's RSA public key: an SPKI PEM (`-----BEGIN PUBLIC KEY-----`,
     * as returned by `generateEncryption()` and {@link generateFlowKeyPair}) or a Web Crypto key.
     */
    publicKey: string | CryptoKey;
    /**
     * Key for the `X-Hub-Signature-256` header: the App Secret the processor is
     * configured with. Leave it out to send an unsigned request.
     */
    appSecret?: string;
    /** Request URL. Defaults to {@link TEST_FLOW_URL}. */
    url?: string;
}

/** The AES key and IV a Flow request was encrypted with; needed to read the reply. */
export interface FlowSessionKeys {
    aesKey: Uint8Array;
    initialVector: Uint8Array;
}

export interface FlowTestRequest extends FlowSessionKeys {
    /** Ready to pass to `processor.processFlow(request)` or a Flow route handler. */
    request: Request;
    /** The encrypted JSON body (`encrypted_aes_key`, `encrypted_flow_data`, `initial_vector`). */
    body: string;
    /** The plaintext that was encrypted. */
    payload: FlowRequestInit;
    /** Shorthand for `decryptFlowResponse(response, this)`. */
    decryptResponse<T = FlowDataExchangeResponse>(response: FlowResponseLike): Promise<T>;
}

/** A Flow endpoint reply: the raw body, `processor.processFlow()`'s result, or a fetch `Response`. */
export type FlowResponseLike = string | { body: string } | Response;

export interface FlowKeyPair {
    publicKey: CryptoKey;
    privateKey: CryptoKey;
    /** SPKI PEM; what you upload to Meta. */
    publicPem: string;
    /** Unencrypted PKCS#8 PEM; pass as `privatePem` (no passphrase needed). */
    privatePem: string;
}

function subtle(): SubtleCrypto {
    const value = globalThis.crypto?.subtle;
    if (!value) throw new Error('Web Crypto (globalThis.crypto.subtle) is not available in this runtime.');
    return value;
}

function toPem(label: string, der: ArrayBuffer): string {
    const lines = bytesToBase64(new Uint8Array(der)).match(/.{1,64}/g) ?? [];
    return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----\n`;
}

/**
 * Generate a throwaway 2048-bit RSA key pair for Flow tests with Web Crypto.
 * Works on every runtime, unlike `generateEncryption()` which needs `node:crypto`.
 */
export async function generateFlowKeyPair(): Promise<FlowKeyPair> {
    const pair = await subtle().generateKey(
        { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true,
        ['encrypt', 'decrypt'],
    );
    return {
        publicKey: pair.publicKey,
        privateKey: pair.privateKey,
        publicPem: toPem('PUBLIC KEY', await subtle().exportKey('spki', pair.publicKey)),
        privatePem: toPem('PRIVATE KEY', await subtle().exportKey('pkcs8', pair.privateKey)),
    };
}

async function importPublicKey(key: string | CryptoKey): Promise<CryptoKey> {
    if (typeof key !== 'string') return key;
    const pem = key.includes('\\n') ? key.replace(/\\n/g, '\n') : key;
    const match = /-----BEGIN PUBLIC KEY-----([\s\S]*?)-----END PUBLIC KEY-----/.exec(pem);
    if (!match) {
        throw new Error(
            'createFlowRequest: publicKey must be an SPKI PEM ("-----BEGIN PUBLIC KEY-----"). ' +
                'Convert a PKCS#1 key with: openssl rsa -RSAPublicKey_in -in key.pem -pubout',
        );
    }
    return subtle().importKey(
        'spki',
        base64ToBytes((match[1] ?? '').replace(/\s+/g, '')),
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt'],
    );
}

function withDefaults(init: FlowRequestInit): FlowRequestInit {
    const action = init.action ?? 'data_exchange';
    const payload: FlowRequestInit = { version: '3.0', ...init, action };
    if (action !== 'ping' && payload.flow_token === undefined) payload.flow_token = 'test-flow-token';
    return payload;
}

/**
 * Encrypt a Flow endpoint request the way Meta does: a fresh AES-128-GCM key
 * encrypts the JSON, and RSA-OAEP (SHA-256) with your public key encrypts that
 * AES key. Use the returned keys (or `decryptResponse`) to read the encrypted reply.
 */
export async function createFlowRequest(init: FlowRequestInit, options: FlowRequestOptions): Promise<FlowTestRequest> {
    const payload = withDefaults(init);
    const crypto = subtle();
    const aesKey = globalThis.crypto.getRandomValues(new Uint8Array(16));
    const initialVector = globalThis.crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.importKey('raw', aesKey, { name: 'AES-GCM' }, false, ['encrypt']);

    const body = JSON.stringify({
        encrypted_aes_key: bytesToBase64(
            new Uint8Array(
                await crypto.encrypt({ name: 'RSA-OAEP' }, await importPublicKey(options.publicKey), aesKey),
            ),
        ),
        encrypted_flow_data: bytesToBase64(
            new Uint8Array(
                await crypto.encrypt({ name: 'AES-GCM', iv: initialVector }, key, utf8Encode(JSON.stringify(payload))),
            ),
        ),
        initial_vector: bytesToBase64(initialVector),
    });

    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (options.appSecret !== undefined) {
        headers['x-hub-signature-256'] = `sha256=${await generateXHub256SigAsync(body, options.appSecret)}`;
    }

    const keys: FlowSessionKeys = { aesKey, initialVector };
    return {
        request: new Request(options.url ?? TEST_FLOW_URL, { method: 'POST', body, headers }),
        body,
        payload,
        aesKey,
        initialVector,
        decryptResponse: (response) => decryptFlowResponse(response, keys),
    };
}

async function responseText(response: FlowResponseLike): Promise<string> {
    if (typeof response === 'string') return response;
    if (response instanceof Response) return response.text();
    return response.body;
}

/**
 * Read a Flow endpoint reply. Encrypted replies (ping, data_exchange) are
 * decrypted with the request's AES key and the bit-flipped IV, as Meta does;
 * plain JSON replies (error notification acknowledgements) are parsed as is.
 */
export async function decryptFlowResponse<T = FlowDataExchangeResponse>(
    response: FlowResponseLike,
    keys: FlowSessionKeys,
): Promise<T> {
    const text = (await responseText(response)).trim();
    if (text.startsWith('{')) return JSON.parse(text) as T;

    const flippedIv = keys.initialVector.map((byte) => ~byte & 0xff);
    const crypto = subtle();
    const key = await crypto.importKey('raw', new Uint8Array(keys.aesKey), { name: 'AES-GCM' }, false, ['decrypt']);
    let plain: ArrayBuffer;
    try {
        plain = await crypto.decrypt({ name: 'AES-GCM', iv: flippedIv }, key, base64ToBytes(text));
    } catch {
        throw new Error(`decryptFlowResponse: could not decrypt the Flow response: ${text.slice(0, 200)}`);
    }
    return JSON.parse(utf8Decode(new Uint8Array(plain))) as T;
}
