# Registration API

## Overview
Register or deregister a phone number with a PIN.

## Endpoints
- POST /{PHONE_NUMBER_ID}/register
- POST /{PHONE_NUMBER_ID}/deregister

## Notes
- PIN must be a 6-digit numeric string.
- Data localization region is optional but recommended when required.

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
