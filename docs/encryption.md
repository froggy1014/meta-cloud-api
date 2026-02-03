# Encryption API

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
