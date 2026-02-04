# Business Profile API

## Overview
Get and update the WhatsApp business profile and profile photo metadata.

## Endpoints
- GET /{PHONE_NUMBER_ID}/whatsapp_business_profile?fields
- POST /{PHONE_NUMBER_ID}/whatsapp_business_profile
- POST /app/uploads?file_length&file_type&file_name
- POST /{UPLOAD_ID}
- GET /{UPLOAD_ID}

## Notes
- Profile updates require `messaging_product: "whatsapp"`.
- Profile photo upload is a 3-step process (create session, upload file, fetch handle).
- Websites accept up to two URLs.

## Example
```ts
import WhatsApp, { BusinessVerticalEnum } from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

const profile = await client.businessProfile.getBusinessProfile([
  'about',
  'email',
  'websites',
]);

await client.businessProfile.updateBusinessProfile({
  messaging_product: 'whatsapp',
  about: 'We provide fast support',
  email: 'support@example.com',
  websites: ['https://example.com'],
  vertical: BusinessVerticalEnum.RETAIL,
});
```

## Example Details
- `getBusinessProfile` uses a fields list to limit returned fields.
- `updateBusinessProfile` requires `messaging_product: "whatsapp"` and supports `about`, `email`, `websites`, and `vertical`.
- Use the `BusinessVerticalEnum` value that best matches your business category.
