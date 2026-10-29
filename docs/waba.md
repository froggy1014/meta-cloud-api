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
- Service pricing policy (added October 30, 2026): request the `service_pricing_policy` field to check whether an account is covered by the service pricing policy for eligible governments and non-profits. The value is `'PAID_EXEMPT'`, `'REGULAR'`, or `'UNKNOWN'` (typed as `WabaServicePricingPolicy`). For the accounts a business portfolio owns or manages for clients, pass the same field to `client.business.getOwnedWhatsAppBusinessAccounts(businessId, { fields: ['service_pricing_policy'] })` or `getClientWhatsAppBusinessAccounts`. Covered accounts' free service messages carry `pricing.subtype: 'paid_exempt'` on status webhooks (see [Messages](messages.md)).
- `conversation_analytics` deprecated (October 27, 2026): Meta stops serving the WABA `conversation_analytics` field beginning November 1, 2026, since conversation-based pricing ended on June 30, 2025. The SDK never typed it (`WabaAccountFields` has no `conversation_analytics`). Use `pricing_analytics` for cost and volume reporting, and `analytics` for sent and delivered counts. See Meta's [Conversation analytics](https://developers.facebook.com/documentation/business-messaging/whatsapp/analytics#conversation-analytics).

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
  'service_pricing_policy',
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
