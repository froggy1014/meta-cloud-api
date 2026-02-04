# Messages API

## Overview
Send text, media, template, interactive, and reaction messages through the Cloud API. Use the message type to select the correct payload.

## Endpoints
- POST /{PHONE_NUMBER_ID}/messages

## Notes
- Always include `messaging_product: "whatsapp"` in message bodies.
- `to` must be an E.164 formatted number string.
- `type` must match the body key (e.g., `type: "text"` with a `text` object).
- Use `context.message_id` to reply to a specific message.

## Example
```ts
import WhatsApp from 'meta-cloud-api';
import { ComponentTypesEnum, LanguagesEnum, ParametersTypesEnum } from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

await client.messages.text({
  to: '15551234567',
  body: 'Hello from Messages API',
});

await client.messages.template({
  to: '15551234567',
  body: {
    name: 'order_update',
    language: { code: LanguagesEnum.English_US },
    components: [
      {
        type: ComponentTypesEnum.Body,
        parameters: [
          { type: ParametersTypesEnum.Text, text: 'Jane' },
          { type: ParametersTypesEnum.Text, text: 'A123' },
        ],
      },
    ],
  },
});
```

## Example Details
- Initialize the client with `accessToken`, `phoneNumberId`, and `businessAcctId` before sending messages.
- `messages.text` requires `to` (E.164) and `body` for the text content.
- `messages.template` uses `template.name`, `template.language.code`, and `components` in template order.
