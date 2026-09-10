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
