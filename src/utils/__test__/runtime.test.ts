import { createHmac, randomBytes } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import packageJson from '../../../package.json';
import {
    base64ToBytes,
    bytesToBase64,
    bytesToHex,
    describeRuntime,
    getNodeCrypto,
    hmacSha256Hex,
    readEnv,
    requireNodeCrypto,
    timingSafeEqualString,
    utf8Decode,
    utf8Encode,
} from '../runtime';
import { getUserAgent, getVersion } from '../version';

afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
});

describe('byte helpers', () => {
    it.each([0, 1, 2, 3, 15, 16, 255, 70_000])('base64 round-trips %i random bytes like Buffer', (size) => {
        const bytes = new Uint8Array(randomBytes(size));
        const encoded = bytesToBase64(bytes);
        expect(encoded).toBe(Buffer.from(bytes).toString('base64'));
        expect(base64ToBytes(encoded)).toEqual(bytes);
    });

    it('hex-encodes like Buffer', () => {
        const bytes = new Uint8Array(randomBytes(64));
        expect(bytesToHex(bytes)).toBe(Buffer.from(bytes).toString('hex'));
    });

    it('utf8 round-trips multi-byte text', () => {
        const text = '안녕 👋 café';
        expect(utf8Decode(utf8Encode(text))).toBe(text);
        expect(Buffer.from(utf8Encode(text)).toString('utf8')).toBe(text);
    });
});

describe('timingSafeEqualString', () => {
    it('compares equal and unequal strings', () => {
        expect(timingSafeEqualString('abc', 'abc')).toBe(true);
        expect(timingSafeEqualString('abc', 'abd')).toBe(false);
        expect(timingSafeEqualString('abc', 'abcd')).toBe(false);
        expect(timingSafeEqualString('', '')).toBe(true);
    });
});

describe('hmacSha256Hex', () => {
    it.each([
        ['secret', ''],
        ['secret', '{"object":"whatsapp_business_account"}'],
        ['ключ', 'body with ünïcödé 🎉'],
    ])('matches node:crypto for key %s', async (key, body) => {
        expect(await hmacSha256Hex(key, body)).toBe(createHmac('sha256', key).update(body, 'utf8').digest('hex'));
    });
});

describe('environment access', () => {
    it('reads process.env when present', () => {
        vi.stubEnv('META_CLOUD_API_TEST_VAR', 'value');
        expect(readEnv('META_CLOUD_API_TEST_VAR')).toBe('value');
    });

    it('returns undefined when process is missing (edge runtimes)', () => {
        vi.stubGlobal('process', undefined);
        expect(readEnv('DEBUG')).toBeUndefined();
        expect(getNodeCrypto()).toBeUndefined();
        expect(() => requireNodeCrypto('feature')).toThrow(/feature needs the node:crypto module/);
        expect(describeRuntime()).toBe('unknown runtime');
    });

    it('loads node:crypto through process.getBuiltinModule', () => {
        expect(getNodeCrypto()?.createHmac).toBeTypeOf('function');
    });
});

describe('describeRuntime', () => {
    it('detects Node.js', () => {
        expect(describeRuntime()).toBe(`Node.js ${process.version}`);
    });

    it('detects Bun, Deno, Edge Runtime and Cloudflare Workers', () => {
        vi.stubGlobal('Bun', { version: '1.2.0' });
        expect(describeRuntime()).toBe('Bun 1.2.0');
        vi.unstubAllGlobals();
        vi.stubGlobal('Deno', { version: { deno: '2.1.0' } });
        expect(describeRuntime()).toBe('Deno 2.1.0');
        vi.unstubAllGlobals();
        vi.stubGlobal('EdgeRuntime', 'vercel');
        expect(describeRuntime()).toBe('Edge Runtime vercel');
        vi.unstubAllGlobals();
        vi.stubGlobal('navigator', { userAgent: 'Cloudflare-Workers' });
        expect(describeRuntime()).toBe('Cloudflare Workers');
    });
});

describe('version', () => {
    it('reports the package.json version instead of "unknown"', () => {
        expect(getVersion()).toBe(packageJson.version);
        expect(getUserAgent()).toBe(`WhatsApp-Nodejs-SDK/${packageJson.version} (Node.js ${process.version})`);
    });
});
