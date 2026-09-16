# Registration API

## Overview
Register or deregister a phone number with a PIN.

## Endpoints
- POST /{PHONE_NUMBER_ID}/register
- POST /{PHONE_NUMBER_ID}/deregister

## Notes
- PIN must be a 6-digit numeric string.
- Data localization region is optional but recommended when required.
- Phone number migration between WhatsApp Business Accounts is **not supported** for accounts on the new WhatsApp account model (documented August 18, 2026). Register the number on the destination WABA instead. The SDK exposes no phone number migration endpoint.

### Embedded Signup integrations
- Embedded Signup v2 is scheduled for deprecation on **October 8, 2026** (date updated September 8, 2026). Migrate your Embedded Signup integration to v4 before that date to avoid disruption; see Meta's [Versions guide](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/versions/).
- Embedded Signup is configured in your onboarding integration, outside this SDK. This deprecation-date change does not change the SDK's phone number registration endpoints or payloads.

### Coexistence onboarding on the new account model
Updated September 22, 2026 for WhatsApp Business app coexistence onboarding and login:

- During onboarding, Meta converts the client's existing WhatsApp Business account into a backward-compatible Messaging account and shares both the client's WhatsApp account and the converted Messaging account with you. No partner-specific Messaging account is created.
- The Messaging account keeps its existing ID, returned as `waba_id`. Treat the returned `waba_id` as the same account you already had, not a new one, and keep using it as `businessAcctId` when constructing the client.
- Subscribe to the `account_update` webhook field for the shared accounts — that is where the lifecycle events for both of them arrive. Register a handler with `processor.onAccountUpdate(...)`; `AccountUpdateEvent` already covers the coexistence lifecycle events (`ACCOUNT_OFFBOARDED`, `ACCOUNT_RECONNECTED`, `PARTNER_ADDED`, `PARTNER_REMOVED` with `disconnection_info`).
- WhatsApp Business app login follows the same conversion, sharing, and returned asset ID semantics.

Onboarding runs in your Embedded Signup integration, outside this SDK. See Meta's [Coexistence onboarding guide](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboard-business-app-users/) and the [account_update reference](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/account_update/). No SDK endpoint, payload, or webhook type change is needed.

## Example
```ts
import WhatsApp, { DataLocalizationRegionEnum } from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

await client.registration.register('123456', DataLocalizationRegionEnum.Asia);
await client.registration.deregister();
```

## Example Details
- `register` takes a 6-digit PIN and optional `DataLocalizationRegionEnum` value.
- `deregister` removes the registration for the configured phone number ID.
- Store the PIN securely if you need to re-register later.
