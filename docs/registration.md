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
- Embedded Signup v2 and v3 are deprecated as of **October 15, 2026**, including their public preview versions (`v2-public-preview`, `v3-public-preview`). Requests for those versions, and requests with no version or an invalid one, are served as v4. Features with no v4 equivalent no longer apply.
- On v4, products such as Marketing Messages Lite are set in your Facebook Login for Business configuration rather than through `featureType`. Create a new configuration to see every product you can use.
- v2 WABA-only sharing (`featureType: "only_waba_sharing"`) keeps working until **November 16, 2026**, then is served as v4. See Meta's [Versions guide](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/versions/).
- Embedded Signup **v5** and `v5-public-preview` are available (changelog dated October 20, 2026). Per Meta's changelog: WhatsApp Business app onboarding is on by default with an opt-out, `sessionInfoVersion` is no longer used, and the session info object adds `messaging_account_ids`, `primary_waac_ids`, and `is_on_biz_app`. Meta's [Versions guide](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/versions/) did not yet list v5 when this note was written (it still showed v4 as the latest), so check it for the `extras` configuration and opt-out flag before upgrading.
- Embedded Signup is configured in your onboarding integration, outside this SDK. The deprecation does not change the SDK's phone number registration endpoints or payloads.

### Coexistence onboarding on the new account model
Updated September 22, 2026 for WhatsApp Business app coexistence onboarding and login:

- During onboarding, Meta converts the client's existing WhatsApp Business account into a backward-compatible Messaging account and shares both the client's WhatsApp account and the converted Messaging account with you. No partner-specific Messaging account is created.
- The Messaging account keeps its existing ID, returned as `waba_id`. Treat the returned `waba_id` as the same account you already had, not a new one, and keep using it as `businessAcctId` when constructing the client.
- Subscribe to the `account_update` webhook field for the shared accounts — that is where the lifecycle events for both of them arrive. Register a handler with `processor.onAccountUpdate(...)`; `AccountUpdateEvent` already covers the coexistence lifecycle events (`ACCOUNT_OFFBOARDED`, `ACCOUNT_RECONNECTED`, `PARTNER_ADDED`, `PARTNER_REMOVED` with `disconnection_info`).
- WhatsApp Business app login follows the same conversion, sharing, and returned asset ID semantics.
- Rollout (dates added September 22, 2026): Phase 1 of the new account model rolls out from **September 23, 2026** and reaches all businesses by **mid-October 2026**. WhatsApp Manager and Meta Business Suite keep showing the previous WABA experience for a business until it is migrated. Existing IDs, endpoints, and access tokens keep working throughout, so no client configuration change is needed.

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
