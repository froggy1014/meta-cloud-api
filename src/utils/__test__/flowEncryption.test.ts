import crypto from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { importConfig } from '../../config/importConfig';
import {
    decryptFlowRequest,
    decryptFlowRequestAsync,
    encryptFlowResponse,
    encryptFlowResponseAsync,
} from '../flowEncryptionUtils';

const passphrase = 'test-passphrase';
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const keys = {
    publicPem: publicKey.export({ type: 'spki', format: 'pem' }) as string,
    pkcs8Plain: privateKey.export({ type: 'pkcs8', format: 'pem' }) as string,
    pkcs8Encrypted: privateKey.export({ type: 'pkcs8', format: 'pem', cipher: 'aes-256-cbc', passphrase }) as string,
    pkcs1Plain: privateKey.export({ type: 'pkcs1', format: 'pem' }) as string,
};

/** Build a request the way Meta does: RSA-OAEP(SHA-256) wrapped AES-128-GCM key. */
function metaRequest(payload: unknown) {
    const aesKey = crypto.randomBytes(16);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-128-gcm', aesKey, iv);
    const data = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final(), cipher.getAuthTag()]);
    return {
        aesKey,
        iv,
        body: {
            encrypted_aes_key: crypto
                .publicEncrypt(
                    { key: keys.publicPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
                    aesKey,
                )
                .toString('base64'),
            encrypted_flow_data: data.toString('base64'),
            initial_vector: iv.toString('base64'),
        },
    };
}

/** Decrypt a response the way Meta does: AES-128-GCM with the bit-flipped IV. */
function metaDecryptResponse(encrypted: string, aesKey: Buffer, iv: Buffer) {
    const raw = Buffer.from(encrypted, 'base64');
    const decipher = crypto.createDecipheriv('aes-128-gcm', aesKey, Buffer.from(iv.map((b) => ~b & 0xff)));
    decipher.setAuthTag(raw.subarray(-16));
    return JSON.parse(Buffer.concat([decipher.update(raw.subarray(0, -16)), decipher.final()]).toString('utf8'));
}

function config(privatePem: string, pass = passphrase) {
    return importConfig({ accessToken: 'token', phoneNumberId: 1, privatePem, passphrase: pass });
}

const payload = { version: '3.0', action: 'data_exchange', screen: 'START', data: { name: 'Zoë 👋' }, flow_token: 't' };

afterEach(() => vi.unstubAllGlobals());

describe('decryptFlowRequestAsync', () => {
    it.each([
        ['unencrypted PKCS#8', keys.pkcs8Plain],
        ['encrypted PKCS#8', keys.pkcs8Encrypted],
        ['PKCS#1', keys.pkcs1Plain],
        ['PKCS#8 with escaped newlines', keys.pkcs8Plain.replace(/\n/g, '\\n')],
    ])('decrypts a Meta request with a %s key', async (_name, pem) => {
        const { body, aesKey, iv } = metaRequest(payload);
        const result = await decryptFlowRequestAsync(body, config(pem));
        expect(result.decryptedBody).toEqual(payload);
        expect(Buffer.from(result.aesKeyBuffer)).toEqual(aesKey);
        expect(Buffer.from(result.initialVectorBuffer)).toEqual(iv);
    });

    it('matches the synchronous node:crypto implementation', async () => {
        const { body } = metaRequest(payload);
        const cfg = config(keys.pkcs8Encrypted);
        const sync = decryptFlowRequest(body, cfg);
        const web = await decryptFlowRequestAsync(body, cfg);
        expect(web.decryptedBody).toEqual(sync.decryptedBody);
        expect(Buffer.from(web.aesKeyBuffer)).toEqual(sync.aesKeyBuffer);
    });

    it('decrypts an unencrypted PKCS#8 key without node:crypto (edge runtimes)', async () => {
        const { body } = metaRequest(payload);
        const cfg = config(keys.pkcs8Plain, '');
        vi.stubGlobal('process', undefined);
        expect((await decryptFlowRequestAsync(body, cfg)).decryptedBody).toEqual(payload);
    });

    it('explains how to convert an encrypted key when node:crypto is missing', async () => {
        const { body } = metaRequest(payload);
        const cfg = config(keys.pkcs8Encrypted);
        vi.stubGlobal('process', undefined);
        await expect(decryptFlowRequestAsync(body, cfg)).rejects.toThrow(/openssl pkcs8 -topk8 -nocrypt/);
    });

    it('rejects a wrong passphrase, a wrong key and tampered data', async () => {
        const { body } = metaRequest(payload);
        await expect(decryptFlowRequestAsync(body, config(keys.pkcs8Encrypted, 'wrong'))).rejects.toThrow(
            /Failed to parse private key/,
        );
        const other = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
        const otherPem = other.privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
        await expect(decryptFlowRequestAsync(body, config(otherPem))).rejects.toThrow(/verify your private key/);
        const tampered = Buffer.from(body.encrypted_flow_data, 'base64');
        tampered[0] = (tampered[0] ?? 0) ^ 0xff;
        await expect(
            decryptFlowRequestAsync(
                { ...body, encrypted_flow_data: tampered.toString('base64') },
                config(keys.pkcs8Plain),
            ),
        ).rejects.toThrow();
    });

    it('validates config and body', async () => {
        const { body } = metaRequest(payload);
        await expect(decryptFlowRequestAsync(body, config(''))).rejects.toThrow(/Missing FLOW_API_PRIVATE_PEM/);
        await expect(decryptFlowRequestAsync({}, config(keys.pkcs8Plain))).rejects.toThrow(
            /Missing required encryption properties/,
        );
        await expect(decryptFlowRequestAsync(body, config('not a pem'))).rejects.toThrow(/PEM encoded/);
    });
});

describe('encryptFlowResponseAsync', () => {
    it('produces a response Meta can decrypt, identical to the sync implementation', async () => {
        const { aesKey, iv } = metaRequest(payload);
        const response = { screen: 'SUCCESS', data: { ok: true, text: '완료' } };
        const web = await encryptFlowResponseAsync(response, aesKey, iv);
        expect(metaDecryptResponse(web, aesKey, iv)).toEqual(response);
        expect(web).toBe(encryptFlowResponse(response, aesKey, iv));
    });

    it('round-trips with decryptFlowRequestAsync without node:crypto', async () => {
        const { body, aesKey, iv } = metaRequest(payload);
        const cfg = config(keys.pkcs8Plain, '');
        vi.stubGlobal('process', undefined);
        const { aesKeyBuffer, initialVectorBuffer } = await decryptFlowRequestAsync(body, cfg);
        const encrypted = await encryptFlowResponseAsync(
            { data: { status: 'active' } },
            aesKeyBuffer,
            initialVectorBuffer,
        );
        vi.unstubAllGlobals();
        expect(metaDecryptResponse(encrypted, aesKey, iv)).toEqual({ data: { status: 'active' } });
    });

    it('encrypts an empty object for an undefined response', async () => {
        const { aesKey, iv } = metaRequest(payload);
        expect(metaDecryptResponse(await encryptFlowResponseAsync(undefined, aesKey, iv), aesKey, iv)).toEqual({});
    });

    it('fails with a clear error for an invalid AES key', async () => {
        await expect(encryptFlowResponseAsync({}, new Uint8Array(3), new Uint8Array(16))).rejects.toThrow(
            /Failed to encrypt response/,
        );
    });
});
