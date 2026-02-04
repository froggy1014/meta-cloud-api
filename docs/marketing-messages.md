# Marketing Messages API

## Overview
Send marketing template messages via `/marketing_messages`.

## Endpoints
- POST /{PHONE_NUMBER_ID}/marketing_messages

## Notes
- Only marketing templates are supported on this endpoint.
- `message_activity_sharing` controls message analytics sharing.

## Example
```ts
import WhatsApp, { LanguagesEnum } from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

await client.marketingMessages.sendTemplateMessage({
  to: '15551234567',
  template: {
    name: 'promo_template',
    language: { code: LanguagesEnum.English_US },
  },
  message_activity_sharing: true,
});
```

## Example Details
- `sendTemplateMessage` requires `to` and `template.name` with `language.code`.
- `message_activity_sharing` toggles analytics sharing for the message.
