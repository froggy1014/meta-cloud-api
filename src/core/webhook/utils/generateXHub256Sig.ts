import { hmacSha256Hex, requireNodeCrypto } from '../../../utils/runtime';

/**
 * Compute the hex HMAC-SHA256 that Meta sends in `X-Hub-Signature-256`
 * (without the `sha256=` prefix). Needs `node:crypto`; use
 * {@link generateXHub256SigAsync} on edge runtimes.
 */
export const generateXHub256Sig = (body: string, appSecret: string) => {
    return requireNodeCrypto('generateXHub256Sig').createHmac('sha256', appSecret).update(body, 'utf-8').digest('hex');
};

/** Web Crypto variant of {@link generateXHub256Sig}; works on every runtime. */
export const generateXHub256SigAsync = (body: string, appSecret: string): Promise<string> => {
    return hmacSha256Hex(appSecret, body);
};
