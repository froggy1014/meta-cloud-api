/**
 * Runtime helpers that keep the SDK free of static `node:*` imports, so the
 * same bundle loads on Node.js, Bun, Deno, Cloudflare Workers and Vercel Edge.
 */

type NodeCrypto = typeof import('node:crypto');

type ProcessLike = {
    env?: Record<string, string | undefined>;
    version?: string;
    versions?: Record<string, string | undefined>;
    getBuiltinModule?: (id: string) => unknown;
};

function getProcess(): ProcessLike | undefined {
    const proc = (globalThis as { process?: ProcessLike }).process;
    return typeof proc === 'object' && proc !== null ? proc : undefined;
}

/**
 * Read an environment variable. Returns undefined on runtimes without
 * `process.env` (e.g. Cloudflare Workers without `nodejs_compat`).
 */
export function readEnv(name: string): string | undefined {
    return getProcess()?.env?.[name];
}

/** True when the `DEBUG` environment variable is `'true'`. */
export function isDebugEnv(): boolean {
    return readEnv('DEBUG') === 'true';
}

/**
 * Load `node:crypto` synchronously without a static import, via
 * `process.getBuiltinModule` (Node.js >= 20.16, Bun, Deno, workerd with
 * `nodejs_compat`). Returns undefined when it is not available.
 */
export function getNodeCrypto(): NodeCrypto | undefined {
    const getBuiltinModule = getProcess()?.getBuiltinModule;
    if (typeof getBuiltinModule !== 'function') return undefined;
    try {
        return getBuiltinModule('node:crypto') as NodeCrypto;
    } catch {
        return undefined;
    }
}

/** Like {@link getNodeCrypto} but throws a descriptive error when missing. */
export function requireNodeCrypto(feature: string): NodeCrypto {
    const crypto = getNodeCrypto();
    if (!crypto) {
        throw new Error(
            `${feature} needs the node:crypto module, which is not available in this runtime. ` +
                'Use the async Web Crypto variant instead, or run on Node.js >= 20.16, Bun or Deno.',
        );
    }
    return crypto;
}

/** Web Crypto `SubtleCrypto`, available on every supported runtime. */
export function getSubtle(): SubtleCrypto {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) {
        throw new Error('Web Crypto (globalThis.crypto.subtle) is not available in this runtime.');
    }
    return subtle;
}

/** Human-readable runtime name for the User-Agent header. */
export function describeRuntime(): string {
    const g = globalThis as {
        Bun?: { version?: string };
        Deno?: { version?: { deno?: string } };
        EdgeRuntime?: string;
        navigator?: { userAgent?: string };
    };
    if (g.Bun?.version) return `Bun ${g.Bun.version}`;
    if (g.Deno?.version?.deno) return `Deno ${g.Deno.version.deno}`;
    if (typeof g.EdgeRuntime === 'string') return `Edge Runtime ${g.EdgeRuntime}`;
    if (g.navigator?.userAgent === 'Cloudflare-Workers') return 'Cloudflare Workers';
    const version = getProcess()?.version;
    if (version) return `Node.js ${version}`;
    return 'unknown runtime';
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function utf8Encode(value: string): Uint8Array<ArrayBuffer> {
    return textEncoder.encode(value) as Uint8Array<ArrayBuffer>;
}

export function utf8Decode(value: Uint8Array): string {
    return textDecoder.decode(value);
}

export function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

export function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
}

export function bytesToHex(bytes: Uint8Array): string {
    let hex = '';
    for (const byte of bytes) {
        hex += byte.toString(16).padStart(2, '0');
    }
    return hex;
}

/** Constant-time string comparison (length is not secret). */
export function timingSafeEqualString(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
}

/** HMAC-SHA256 hex digest using Web Crypto. */
export async function hmacSha256Hex(key: string, data: string): Promise<string> {
    const subtle = getSubtle();
    const cryptoKey = await subtle.importKey('raw', utf8Encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, [
        'sign',
    ]);
    const signature = await subtle.sign('HMAC', cryptoKey, utf8Encode(data));
    return bytesToHex(new Uint8Array(signature));
}
