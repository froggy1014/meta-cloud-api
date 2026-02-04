# Two-Step Verification API

## Overview
Set or update the two-step verification PIN for a phone number.

## Endpoints
- POST /{PHONE_NUMBER_ID}

## Notes
- PIN must be a 6-digit numeric string.
- Endpoint uses the phone number ID directly.

## Example
```ts
import WhatsApp from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

await client.twoStepVerification.setTwoStepVerificationCode('123456');
```

## Example Details
- `setTwoStepVerificationCode` sends a 6-digit PIN to the phone number ID.
- Reuse the same PIN for updates to avoid accidental lockouts.
