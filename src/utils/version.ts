import { describeRuntime } from './runtime';

/**
 * SDK version, replaced with the package.json version at build time
 * (see `define` in tsdown.config.ts and vitest.config.ts).
 */
declare const __SDK_VERSION__: string;

/**
 * Get SDK version from package.json
 */
export function getVersion(): string {
    return typeof __SDK_VERSION__ === 'string' ? __SDK_VERSION__ : 'unknown';
}

/**
 * Generate User-Agent string following official SDK pattern
 */
export function getUserAgent(): string {
    return `WhatsApp-Nodejs-SDK/${getVersion()} (${describeRuntime()})`;
}
