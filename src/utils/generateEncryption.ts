/**
 * WhatsApp Business Encryption Key Generation Utility
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/whatsapp-business-encryption/
 */

import crypto from 'crypto';

import Logger from './logger';

const LIB_NAME = 'GENERATE_ENCRYPTION';
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

    LOGGER.info('Environment validation passed');
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
    LOGGER.info('Starting encryption key generation');

    // Validate environment first
    validateNodeEnvironment();

    // Get passphrase from parameter or environment variable
    const effectivePassphrase = passphrase || process.env.FLOW_API_PASSPHRASE;

    // Validate passphrase
    if (!effectivePassphrase || effectivePassphrase.trim().length === 0) {
        const error = new Error(
            'Passphrase is empty. Please provide a passphrase as parameter or set FLOW_API_PASSPHRASE environment variable.',
        );
        LOGGER.error('Passphrase validation failed:', error);
        throw error;
    }

    // Warn if passphrase is too short
    if (effectivePassphrase.length < 8) {
        LOGGER.warn(
            'Passphrase is shorter than 8 characters. ' + 'Consider using a longer passphrase for better security.',
        );
    }

    try {
        LOGGER.info('Generating RSA key pair with 2048-bit modulus');

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

        LOGGER.info('Key pair generated successfully');

        return {
            passphrase: effectivePassphrase,
            privateKey: keyPair.privateKey,
            publicKey: keyPair.publicKey,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const generationError = new Error(`Failed to generate key pair: ${errorMessage}`);
        LOGGER.error('Key generation failed:', generationError);
        throw generationError;
    }
}
