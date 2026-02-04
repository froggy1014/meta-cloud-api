# WABA API

## Overview
Manage WABA metadata and webhook subscriptions.

## Endpoints
- GET /{WABA_ID}?fields
- GET /{WABA_ID}/subscribed_apps
- POST /{WABA_ID}/subscribed_apps
- DELETE /{WABA_ID}/subscribed_apps

## Notes
- Use `fields` to select specific WABA properties.
- Webhook subscriptions require `override_callback_uri` and `verify_token`.

## Example
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

## Example Details
- `getWabaAccount` accepts a fields array to select account metadata.
- `updateWabaSubscription` requires `override_callback_uri` and `verify_token` for webhook setup.
- `unsubscribeFromWaba` removes the current app subscription.
