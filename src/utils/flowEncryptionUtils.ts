/**
 * WhatsApp Flow Encryption/Decryption Utilities
 * Handles encryption and decryption of WhatsApp Flow requests and responses
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/whatsapp-business-encryption/
 */

import crypto from 'crypto';

import { FlowEndpointRequest } from '../api/flow';
import { WabaConfigType } from '../types/config';
import Logger from './logger';

const LIB_NAME = 'FLOW_ENCRYPTION_UTILS';
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true');

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
function validateNodeEnvironment(): void {
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
    if (process.versions && process.versions.node) {
        const nodeVersion = process.versions.node.split('.').map(Number);
        const major = nodeVersion[0] ?? 0;
        const minor = nodeVersion[1] ?? 0;

        if (major < 10 || (major === 10 && minor < 12)) {
            const error = new Error(
                `Node.js version ${process.versions.node} is not supported. ` +
                    'Please upgrade to Node.js 10.12.0 or higher.',
            );
            LOGGER.error('Node.js version check failed:', error);
            throw error;
        }
    }
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
    validateNodeEnvironment();

    // Get passphrase from parameter or environment variable
    const effectivePassphrase = passphrase || process.env.FLOW_API_PASSPHRASE;

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
 * Decrypt a WhatsApp Flow request
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

    let privateKey;
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
        LOGGER.error('[decryptFlowRequest] Failed to load private key:', {
            error: error instanceof Error ? error.message : error,
            hasPassphrase: !!passphrase,
            format: isPKCS8 ? 'PKCS#8' : isPKCS1 ? 'PKCS#1' : 'Unknown',
        });

        // Provide helpful error message
        let errorMessage = `Failed to parse private key. Error: ${error instanceof Error ? error.message : error}`;

        if (isPKCS1) {
            errorMessage += '\n\nYour key is in PKCS#1 format (-----BEGIN RSA PRIVATE KEY-----).';
            errorMessage += '\nPlease convert it to PKCS#8 format using:';
            errorMessage += '\n  openssl pkcs8 -topk8 -inform PEM -outform PEM -in old_key.pem -out new_key.pem';
            errorMessage += '\n\nOr ensure your key uses a supported encryption algorithm (not DES-EDE3-CBC).';
        } else if (!isPKCS8) {
            errorMessage += '\n\nYour key format is not recognized. Please ensure it is in PKCS#8 format.';
        }

        throw new Error(errorMessage);
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
 * Encrypt a WhatsApp Flow response
 * @param response - Response object to encrypt
 * @param aesKeyBuffer - AES key buffer from the decrypted request
 * @param initialVectorBuffer - Initial vector buffer from the decrypted request
 * @returns Base64-encoded encrypted response
 * @throws {Error} If encryption fails
 */
export function encryptFlowResponse(response: any, aesKeyBuffer: Buffer, initialVectorBuffer: Buffer): string {
    LOGGER.info('[encryptFlowResponse] Starting Flow response encryption');

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
