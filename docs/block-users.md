# Block Users API

```ts
import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

await client.blockUsers.block(['15551234567']);
await client.blockUsers.unblock(['15551234567']);

const list = await client.blockUsers.listBlockedUsers({ limit: 10 });
```
