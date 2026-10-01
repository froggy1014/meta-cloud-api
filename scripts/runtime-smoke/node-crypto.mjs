// Compatibility smoke for the supported Node floor, including encrypted keys.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { generateEncryption as generateFromUtils } from 'meta-cloud-api/utils';
import {
    WebhookProcessor,
    decryptFlowRequest,
    decryptFlowRequestAsync,
    encryptFlowResponse,
    encryptFlowResponseAsync,
    generateEncryption,
    generateXHub256Sig,
    isValidWebhookSignature,
} from 'meta-cloud-api';

const secret = 'smoke-app-secret';
const passphrase = 'smoke-passphrase';
assert.match(generateFromUtils(passphrase).privateKey, /BEGIN ENCRYPTED PRIVATE KEY/);
const pair = generateEncryption(passphrase);
const key = crypto.createPrivateKey({ key: pair.privateKey, passphrase });
const aes = crypto.randomBytes(16);
const iv = crypto.randomBytes(16);
const payload = { version: '3.0', action: 'ping' };
const cipher = crypto.createCipheriv('aes-128-gcm', aes, iv);
const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final(), cipher.getAuthTag()]);
const body = {
    encrypted_aes_key: crypto
        .publicEncrypt(
            { key: pair.publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
            aes,
        )
        .toString('base64'),
    encrypted_flow_data: encrypted.toString('base64'),
    initial_vector: iv.toString('base64'),
};
const raw = JSON.stringify(body);
const digest = crypto.createHmac('sha256', secret).update(raw).digest('hex');
assert.equal(generateXHub256Sig(raw, secret), digest);
assert.equal(isValidWebhookSignature(raw, `sha256=${digest}`, secret), true);

for (const privatePem of [pair.privateKey, key.export({ type: 'pkcs1', format: 'pem' })]) {
    const cfg = { FLOW_API_PRIVATE_PEM: privatePem, FLOW_API_PASSPHRASE: passphrase };
    assert.deepEqual(decryptFlowRequest(body, cfg).decryptedBody, payload);
    assert.deepEqual((await decryptFlowRequestAsync(body, cfg)).decryptedBody, payload);
    const processor = new WebhookProcessor({
        accessToken: 'smoke-token',
        phoneNumberId: 123,
        appSecret: secret,
        privatePem,
        passphrase,
    });
    const result = await processor.processFlow(
        new Request('https://example.com/flow', {
            method: 'POST',
            body: raw,
            headers: { 'x-hub-signature-256': `sha256=${digest}` },
        }),
    );
    assert.equal(result.status, 200);
    const response = { version: '3.0', data: { status: 'active' } };
    assert.equal(result.body, encryptFlowResponse(response, aes, iv));
    assert.equal(result.body, await encryptFlowResponseAsync(response, aes, iv));
}
console.log(`ok: sync helpers and encrypted PKCS8/PKCS1 Flow (${process.version})`);
