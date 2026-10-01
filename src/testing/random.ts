import { bytesToBase64 } from '../utils/runtime';

function randomBytes(length: number): Uint8Array {
    return globalThis.crypto.getRandomValues(new Uint8Array(length));
}

/** A random message ID shaped like Meta's (`wamid.` followed by base64). */
export function randomWamid(): string {
    return `wamid.HBgL${bytesToBase64(randomBytes(24))}`;
}

/** A random numeric ID such as a media ID (no leading zero). */
export function randomDigits(length: number): string {
    let digits = String(1 + ((randomBytes(1)[0] ?? 0) % 9));
    for (const byte of randomBytes(length - 1)) digits += String(byte % 10);
    return digits;
}
