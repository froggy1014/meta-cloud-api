# Encryption API

## Overview
Manage the business public key used for Flows encryption.

## Endpoints
- GET /{PHONE_NUMBER_ID}/whatsapp_business_encryption
- POST /{PHONE_NUMBER_ID}/whatsapp_business_encryption

## Notes
- POST uses `multipart/form-data` with `business_public_key`.
- Use the SDK helper `generateEncryption()` to create a key pair.

## Example
```ts
import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

const keyPair = client.generateEncryption();
await client.encryption.setEncryptionPublicKey(keyPair.publicKey);

const publicKey = await client.encryption.getEncryptionPublicKey();
```

## Example Details
- `generateEncryption` creates a key pair; keep the private key stored securely.
- `setEncryptionPublicKey` uploads the public key as multipart form data.
- `getEncryptionPublicKey` verifies the active key on the phone number.
