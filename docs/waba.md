# WABA API

```ts
import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

const account = await client.waba.getWabaAccount([
  'id',
  'name',
  'status',
  'timezone_id',
  'primary_business_location',
]);

const subscriptions = await client.waba.getAllWabaSubscriptions();

await client.waba.updateWabaSubscription({
  override_callback_uri: 'https://example.com/webhook',
  verify_token: 'verify-token',
});

await client.waba.unsubscribeFromWaba();
```
