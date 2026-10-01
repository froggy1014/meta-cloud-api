/**
 * WhatsApp Flow Encryption/Decryption Utilities
 * Handles encryption and decryption of WhatsApp Flow requests and responses
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/whatsapp-business-encryption/
 */

import type { KeyObject } from 'node:crypto';

import type { FlowEndpointRequest } from '../api/flow';
import type { WabaConfigType } from '../types/config';
import Logger from './logger';
import {
    base64ToBytes,
    bytesToBase64,
    getNodeCrypto,
    getSubtle,
    isDebugEnv,
    readEnv,
    requireNodeCrypto,
    utf8Decode,
    utf8Encode,
} from './runtime';

const LIB_NAME = 'FLOW_ENCRYPTION_UTILS';
const LOGGER = new Logger(LIB_NAME, isDebugEnv());

/**
 * Environment model for encryption keys
 */
export type EncryptionKeyPair = {
    passphrase: string;
    privateKey: string;
    publicKey: string;
};

/**
 * Validates that the code is running in a Node.js environment
 * @throws {Error} If not running in Node.js environment
 */
function validateNodeEnvironment(): typeof import('node:crypto') {
    const crypto = getNodeCrypto();
    // Check if crypto module exists and has required methods
    if (!crypto || typeof crypto.generateKeyPairSync !== 'function') {
        const error = new Error(
            'This utility requires Node.js environment with crypto module. ' +
                'It cannot be used in browser or edge runtime environments.',
        );
        LOGGER.error('Environment validation failed:', error);
        throw error;
    }

    // Check if running in browser
    if (typeof window !== 'undefined') {
        const error = new Error(
            'This utility cannot run in a browser environment. ' +
                'Please use it in a Node.js server environment only.',
        );
        LOGGER.error('Browser environment detected:', error);
        throw error;
    }

    // Check Node.js version (crypto.generateKeyPairSync requires Node.js 10.12.0+)
    const nodeVersionString = (globalThis as { process?: { versions?: { node?: string } } }).process?.versions?.node;
    if (nodeVersionString) {
        const nodeVersion = nodeVersionString.split('.').map(Number);
        const major = nodeVersion[0] ?? 0;
        const minor = nodeVersion[1] ?? 0;

        if (major < 10 || (major === 10 && minor < 12)) {
            const error = new Error(
                `Node.js version ${nodeVersionString} is not supported. ` +
                    'Please upgrade to Node.js 10.12.0 or higher.',
            );
            LOGGER.error('Node.js version check failed:', error);
            throw error;
        }
    }

    return crypto;
}

/**
 * Generates RSA key pair for WhatsApp Business Flow API encryption
 *
 * This function generates a 2048-bit RSA key pair with:
 * - Public key in SPKI format (PEM)
 * - Private key in PKCS#8 format (PEM) encrypted with AES-256-CBC
 *
 * @param passphrase - Passphrase to encrypt the private key. If not provided, uses FLOW_API_PASSPHRASE from environment
 * @returns Object containing passphrase, privateKey, and publicKey
 * @throws {Error} If passphrase is empty or key generation fails
 * @throws {Error} If not running in Node.js environment
 *
 * @example
 * ```typescript
 * import { WhatsApp } from 'meta-cloud-api';
 *
 * const wa = new WhatsApp();
 *
 * try {
 *   // Uses FLOW_API_PASSPHRASE from environment
 *   const keys = wa.generateEncryption();
 *   console.log('Public Key:', keys.publicKey);
 *   console.log('Private Key:', keys.privateKey);
 *
 *   // Or provide custom passphrase
 *   const customKeys = wa.generateEncryption('my-secret-passphrase');
 * } catch (error) {
 *   console.error('Failed to generate keys:', error.message);
 * }
 * ```
 */
export function generateEncryption(passphrase?: string): EncryptionKeyPair {
    LOGGER.info('[generateEncryption] Starting key pair generation');

    // Validate environment first
    const crypto = validateNodeEnvironment();

    // Get passphrase from parameter or environment variable
    const effectivePassphrase = passphrase || readEnv('FLOW_API_PASSPHRASE');

    // Validate passphrase
    if (!effectivePassphrase || effectivePassphrase.trim().length === 0) {
        const error = new Error(
            'Passphrase is empty. Please provide a passphrase as parameter or set FLOW_API_PASSPHRASE environment variable.',
        );
        LOGGER.error('[generateEncryption] Passphrase validation failed:', error);
        throw error;
    }

    // Warn if passphrase is too short
    if (effectivePassphrase.length < 8) {
        LOGGER.warn(
            '[generateEncryption] Passphrase is shorter than 8 characters. Consider using a longer passphrase for better security.',
        );
    }

    try {
        LOGGER.info('[generateEncryption] Generating 2048-bit RSA key pair');

        // Generate RSA key pair
        const keyPair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                cipher: 'aes-256-cbc',
                passphrase: effectivePassphrase,
            },
        });

        LOGGER.info('[generateEncryption] Key pair generated successfully');

        return {
            passphrase: effectivePassphrase,
            privateKey: keyPair.privateKey,
            publicKey: keyPair.publicKey,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const generationError = new Error(`Failed to generate key pair: ${errorMessage}`);
        LOGGER.error('[generateEncryption] Key generation failed:', generationError);
        throw generationError;
    }
}

/**
 * Decrypt a WhatsApp Flow request (Node.js only; see {@link decryptFlowRequestAsync} for every runtime)
 * @param body - Encrypted request body containing encrypted_aes_key, encrypted_flow_data, and initial_vector
 * @param config - WABA configuration containing FLOW_API_PRIVATE_PEM and FLOW_API_PASSPHRASE
 * @returns Decrypted flow request body, AES key buffer, and initial vector buffer
 * @throws {Error} If required encryption properties are missing or decryption fails
 */
export function decryptFlowRequest(
    body: any,
    config: WabaConfigType,
): {
    decryptedBody: FlowEndpointRequest;
    aesKeyBuffer: Buffer;
    initialVectorBuffer: Buffer;
} {
    LOGGER.info('[decryptFlowRequest] Starting Flow request decryption');

    const crypto = requireNodeCrypto('decryptFlowRequest');

    // Validate required environment variables
    if (!config.FLOW_API_PRIVATE_PEM || config.FLOW_API_PRIVATE_PEM.trim() === '') {
        const error = new Error(
            'Missing FLOW_API_PRIVATE_PEM. Please set the FLOW_API_PRIVATE_PEM environment variable or pass privatePem via config.',
        );
        LOGGER.error('[decryptFlowRequest] Configuration error:', error);
        throw error;
    }

    if (!config.FLOW_API_PASSPHRASE || config.FLOW_API_PASSPHRASE.trim() === '') {
        const error = new Error(
            'Missing FLOW_API_PASSPHRASE. Please set the FLOW_API_PASSPHRASE environment variable or pass passphrase via config.',
        );
        LOGGER.error('[decryptFlowRequest] Configuration error:', error);
        throw error;
    }

    LOGGER.info('[decryptFlowRequest] Configuration validated');

    const { encrypted_aes_key, encrypted_flow_data, initial_vector } = body;

    if (!encrypted_aes_key || !encrypted_flow_data || !initial_vector) {
        LOGGER.error('[decryptFlowRequest] Missing required encryption properties in request body');
        throw new Error('Missing required encryption properties');
    }

    LOGGER.info('[decryptFlowRequest] Request body validated');

    // Handle both escaped and unescaped newlines
    let privatePem = config.FLOW_API_PRIVATE_PEM;
    if (privatePem.includes('\\n')) {
        privatePem = privatePem.replace(/\\n/g, '\n');
    }

    const passphrase = config.FLOW_API_PASSPHRASE;

    const isPKCS1 = privatePem.includes('-----BEGIN RSA PRIVATE KEY-----');
    const isPKCS8 =
        privatePem.includes('-----BEGIN PRIVATE KEY-----') ||
        privatePem.includes('-----BEGIN ENCRYPTED PRIVATE KEY-----');

    LOGGER.info('[decryptFlowRequest] Loading private key', {
        format: isPKCS8 ? 'PKCS#8' : isPKCS1 ? 'PKCS#1' : 'Unknown',
    });

    let privateKey: KeyObject;
    try {
        // Try to create private key with passphrase
        if (passphrase) {
            privateKey = crypto.createPrivateKey({
                key: privatePem,
                format: 'pem',
                passphrase,
            });
        } else {
            privateKey = crypto.createPrivateKey(privatePem);
        }
        LOGGER.info('[decryptFlowRequest] Private key loaded successfully');
    } catch (error) {
        LOGGER.error('[decryptFlowRequest] Failed to load private key (first attempt):', {
            error: error instanceof Error ? error.message : error,
            hasPassphrase: !!passphrase,
            format: isPKCS8 ? 'PKCS#8' : isPKCS1 ? 'PKCS#1' : 'Unknown',
        });

        // If PKCS#1 key failed, try to convert it to PKCS#8 format automatically
        if (isPKCS1 && passphrase) {
            try {
                LOGGER.info('[decryptFlowRequest] Attempting to convert PKCS#1 to PKCS#8 format');

                // First, load the PKCS#1 key with passphrase
                const pkcs1Key = crypto.createPrivateKey({
                    key: privatePem,
                    format: 'pem',
                    passphrase,
                });

                // Export it as PKCS#8 with the same passphrase
                const pkcs8Pem = pkcs1Key.export({
                    type: 'pkcs8',
                    format: 'pem',
                    cipher: 'aes-256-cbc',
                    passphrase,
                });

                // Now create the private key from PKCS#8 format
                privateKey = crypto.createPrivateKey({
                    key: pkcs8Pem as string,
                    format: 'pem',
                    passphrase,
                });

                LOGGER.info('[decryptFlowRequest] Successfully converted PKCS#1 to PKCS#8 and loaded private key');
            } catch (conversionError) {
                LOGGER.error('[decryptFlowRequest] Failed to convert PKCS#1 to PKCS#8:', {
                    error: conversionError instanceof Error ? conversionError.message : conversionError,
                });

                // Provide helpful error message
                let errorMessage = `Failed to parse private key. Error: ${error instanceof Error ? error.message : error}`;
                errorMessage += '\n\nYour key is in PKCS#1 format with unsupported encryption (DES-EDE3-CBC).';
                errorMessage += '\nPlease convert it to PKCS#8 format using:';
                errorMessage += '\n  openssl pkcs8 -topk8 -inform PEM -outform PEM -in old_key.pem -out new_key.pem';

                throw new Error(errorMessage);
            }
        } else {
            // Provide helpful error message
            let errorMessage = `Failed to parse private key. Error: ${error instanceof Error ? error.message : error}`;

            if (isPKCS1) {
                errorMessage += '\n\nYour key is in PKCS#1 format (-----BEGIN RSA PRIVATE KEY-----).';
                errorMessage += '\nPlease convert it to PKCS#8 format using:';
                errorMessage += '\n  openssl pkcs8 -topk8 -inform PEM -outform PEM -in old_key.pem -out new_key.pem';
            } else if (!isPKCS8) {
                errorMessage += '\n\nYour key format is not recognized. Please ensure it is in PKCS#8 format.';
            }

            throw new Error(errorMessage);
        }
    }

    let decryptedAesKey: Buffer;

    try {
        LOGGER.info('[decryptFlowRequest] Decrypting AES key with RSA private key');
        decryptedAesKey = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            Buffer.from(encrypted_aes_key, 'base64'),
        );
        LOGGER.info('[decryptFlowRequest] AES key decrypted successfully');
    } catch (error) {
        LOGGER.error('[decryptFlowRequest] Failed to decrypt AES key:', error);
        throw new Error('Failed to decrypt the request. Please verify your private key.');
    }

    const flowDataBuffer = Buffer.from(encrypted_flow_data, 'base64');
    const initialVectorBuffer = Buffer.from(initial_vector, 'base64');

    const TAG_LENGTH = 16;
    const encrypted_flow_data_body = flowDataBuffer.subarray(0, -TAG_LENGTH);
    const encrypted_flow_data_tag = flowDataBuffer.subarray(-TAG_LENGTH);

    LOGGER.info('[decryptFlowRequest] Decrypting flow data with AES-128-GCM');

    const decipher = crypto.createDecipheriv('aes-128-gcm', decryptedAesKey, initialVectorBuffer);
    decipher.setAuthTag(encrypted_flow_data_tag);

    const decryptedJSONString = Buffer.concat([decipher.update(encrypted_flow_data_body), decipher.final()]).toString(
        'utf-8',
    );

    LOGGER.info('[decryptFlowRequest] Flow request decrypted successfully');

    return {
        decryptedBody: JSON.parse(decryptedJSONString),
        aesKeyBuffer: decryptedAesKey,
        initialVectorBuffer,
    };
}

/**
 * Encrypt a WhatsApp Flow response (Node.js only; see {@link encryptFlowResponseAsync} for every runtime)
 * @param response - Response object to encrypt
 * @param aesKeyBuffer - AES key buffer from the decrypted request
 * @param initialVectorBuffer - Initial vector buffer from the decrypted request
 * @returns Base64-encoded encrypted response
 * @throws {Error} If encryption fails
 */
export function encryptFlowResponse(response: any, aesKeyBuffer: Buffer, initialVectorBuffer: Buffer): string {
    LOGGER.info('[encryptFlowResponse] Starting Flow response encryption');

    const crypto = requireNodeCrypto('encryptFlowResponse');

    const flipped_iv: number[] = [];
    for (const pair of Array.from(initialVectorBuffer.entries())) {
        flipped_iv.push(~pair[1]);
    }

    try {
        LOGGER.info('[encryptFlowResponse] Encrypting response with AES-128-GCM');
        const cipher = crypto.createCipheriv('aes-128-gcm', aesKeyBuffer, Buffer.from(flipped_iv));
        const encryptedResponse = Buffer.concat([
            cipher.update(JSON.stringify(response || {}), 'utf-8'),
            cipher.final(),
            cipher.getAuthTag(),
        ]).toString('base64');

        LOGGER.info('[encryptFlowResponse] Flow response encrypted successfully');

        return encryptedResponse;
    } catch (error) {
        LOGGER.error('[encryptFlowResponse] Response encryption failed:', error);
        throw new Error('Failed to encrypt response. Internal server error.');
    }
}

/**
 * Result of {@link decryptFlowRequestAsync}. Pass `aesKeyBuffer` and
 * `initialVectorBuffer` to {@link encryptFlowResponseAsync}.
 */
export type DecryptedFlowRequest = {
    decryptedBody: FlowEndpointRequest;
    aesKeyBuffer: Uint8Array<ArrayBuffer>;
    initialVectorBuffer: Uint8Array<ArrayBuffer>;
};

const PEM_PATTERN = /-----BEGIN ([A-Z ]+)-----([\s\S]*?)-----END \1-----/;

let cachedPrivateKey: { pem: string; passphrase: string; key: Promise<CryptoKey> } | undefined;

/**
 * Turn a PEM private key into PKCS#8 DER bytes that Web Crypto can import.
 * Unencrypted PKCS#8 (`BEGIN PRIVATE KEY`) works everywhere. Encrypted PKCS#8
 * and PKCS#1 keys need `node:crypto` to unwrap, because Web Crypto has no
 * passphrase support; on runtimes without it a descriptive error is thrown.
 */
function privatePemToPkcs8Der(privatePem: string, passphrase: string): Uint8Array<ArrayBuffer> {
    const match = PEM_PATTERN.exec(privatePem);
    if (!match) {
        throw new Error('Failed to parse private key. Expected a PEM encoded PKCS#8 private key.');
    }
    const label = match[1];
    if (label === 'PRIVATE KEY') {
        return base64ToBytes((match[2] ?? '').replace(/\s+/g, ''));
    }

    const crypto = getNodeCrypto();
    if (!crypto) {
        throw new Error(
            `Failed to parse private key. "${label}" keys need node:crypto, which this runtime lacks. ` +
                'Convert the key to an unencrypted PKCS#8 key and keep it in a secret store:' +
                '\n  openssl pkcs8 -topk8 -nocrypt -in private.pem -out private-pkcs8.pem',
        );
    }
    try {
        const keyObject = crypto.createPrivateKey({
            key: privatePem,
            format: 'pem',
            passphrase: passphrase || undefined,
        });
        const der = keyObject.export({ type: 'pkcs8', format: 'der' });
        return new Uint8Array(der);
    } catch (error) {
        throw new Error(`Failed to parse private key. Error: ${error instanceof Error ? error.message : error}`);
    }
}

function importFlowPrivateKey(privatePem: string, passphrase: string): Promise<CryptoKey> {
    if (cachedPrivateKey && cachedPrivateKey.pem === privatePem && cachedPrivateKey.passphrase === passphrase) {
        return cachedPrivateKey.key;
    }
    const key = (async () =>
        getSubtle().importKey(
            'pkcs8',
            privatePemToPkcs8Der(privatePem, passphrase),
            { name: 'RSA-OAEP', hash: 'SHA-256' },
            false,
            ['decrypt'],
        ))();
    cachedPrivateKey = { pem: privatePem, passphrase, key };
    // Do not keep a rejected promise around; a corrected config should retry.
    key.catch(() => {
        if (cachedPrivateKey?.key === key) cachedPrivateKey = undefined;
    });
    return key;
}

/**
 * Decrypt a WhatsApp Flow request with Web Crypto. Works on Node.js, Bun, Deno,
 * Cloudflare Workers and Vercel Edge.
 *
 * On runtimes without `node:crypto` the private key must be an unencrypted
 * PKCS#8 PEM (`-----BEGIN PRIVATE KEY-----`); the passphrase is then ignored.
 *
 * @param body - Encrypted request body containing encrypted_aes_key, encrypted_flow_data, and initial_vector
 * @param config - WABA configuration containing FLOW_API_PRIVATE_PEM and (for encrypted keys) FLOW_API_PASSPHRASE
 * @throws {Error} If required encryption properties are missing or decryption fails
 */
export async function decryptFlowRequestAsync(body: any, config: WabaConfigType): Promise<DecryptedFlowRequest> {
    if (!config.FLOW_API_PRIVATE_PEM || config.FLOW_API_PRIVATE_PEM.trim() === '') {
        throw new Error(
            'Missing FLOW_API_PRIVATE_PEM. Please set the FLOW_API_PRIVATE_PEM environment variable or pass privatePem via config.',
        );
    }

    const { encrypted_aes_key, encrypted_flow_data, initial_vector } = body ?? {};
    if (!encrypted_aes_key || !encrypted_flow_data || !initial_vector) {
        throw new Error('Missing required encryption properties');
    }

    let privatePem = config.FLOW_API_PRIVATE_PEM;
    if (privatePem.includes('\\n')) {
        privatePem = privatePem.replace(/\\n/g, '\n');
    }

    const subtle = getSubtle();
    const privateKey = await importFlowPrivateKey(privatePem, config.FLOW_API_PASSPHRASE || '');

    let aesKeyBuffer: Uint8Array<ArrayBuffer>;
    try {
        aesKeyBuffer = new Uint8Array(
            await subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, base64ToBytes(encrypted_aes_key)),
        );
    } catch (error) {
        LOGGER.error('[decryptFlowRequestAsync] Failed to decrypt AES key:', error);
        throw new Error('Failed to decrypt the request. Please verify your private key.');
    }

    const initialVectorBuffer = base64ToBytes(initial_vector);
    const aesKey = await subtle.importKey('raw', aesKeyBuffer, { name: 'AES-GCM' }, false, ['decrypt']);
    // Meta sends ciphertext || 16-byte tag, which is exactly what Web Crypto expects.
    const decrypted = await subtle.decrypt(
        { name: 'AES-GCM', iv: initialVectorBuffer, tagLength: 128 },
        aesKey,
        base64ToBytes(encrypted_flow_data),
    );

    return {
        decryptedBody: JSON.parse(utf8Decode(new Uint8Array(decrypted))),
        aesKeyBuffer,
        initialVectorBuffer,
    };
}

/**
 * Encrypt a WhatsApp Flow response with Web Crypto. Works on every runtime.
 * @param response - Response object to encrypt
 * @param aesKeyBuffer - AES key from {@link decryptFlowRequestAsync} (a Node.js Buffer also works)
 * @param initialVectorBuffer - Initial vector from {@link decryptFlowRequestAsync} (a Node.js Buffer also works)
 * @returns Base64-encoded encrypted response
 */
export async function encryptFlowResponseAsync(
    response: any,
    aesKeyBuffer: Uint8Array,
    initialVectorBuffer: Uint8Array,
): Promise<string> {
    const flippedIv = new Uint8Array(initialVectorBuffer.length);
    for (let i = 0; i < initialVectorBuffer.length; i++) {
        flippedIv[i] = ~(initialVectorBuffer[i] ?? 0) & 0xff;
    }

    try {
        const subtle = getSubtle();
        const aesKey = await subtle.importKey('raw', new Uint8Array(aesKeyBuffer), { name: 'AES-GCM' }, false, [
            'encrypt',
        ]);
        const encrypted = await subtle.encrypt(
            { name: 'AES-GCM', iv: flippedIv, tagLength: 128 },
            aesKey,
            utf8Encode(JSON.stringify(response || {})),
        );
        return bytesToBase64(new Uint8Array(encrypted));
    } catch (error) {
        LOGGER.error('[encryptFlowResponseAsync] Response encryption failed:', error);
        throw new Error('Failed to encrypt response. Internal server error.');
    }
}
