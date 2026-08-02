# Direct Send

## Overview
Direct Send sends business-initiated utility and authentication messages through the standard messages endpoint without pre-creating a template — Meta generates and matches the template behind the scenes. Add a top-level `category` to any supported message to opt in.

Utility messaging became generally available on July 31, 2026.

## Endpoints
- POST /{PHONE_NUMBER_ID}/messages

## Notes
- `category` accepts `'utility'`, `'authentication'`, or `'service'`. Omitting it is equivalent to `'service'` and keeps normal free-form send behavior.
- `'authentication'` is access restricted, cannot be sent to a business-scoped user ID, and supports text only.
- Supported utility formats: text, CTA URL buttons, reply buttons, mixed buttons (10 total, max 2 CTA), image/video/document headers, custom TTL, and the voice call button.
- Not supported: marketing messages, PSTN phone number buttons, address, audio, contacts, location, sticker, and reaction messages.
- `preview_url` is ignored — Direct Send messages do not render a URL preview.
- `directSendConfig.template_name` pins message-to-template attribution (utility only). Names must match `^[a-z0-9_]+$` and be unique within the WABA.
- The message-status webhook carries an extra `template_id` field for Direct Send messages.
- Sending a `category` from an ineligible WABA returns error `100`.

## Example
```ts
import WhatsApp, { InteractiveTypesEnum, MessageCategoryEnum } from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

await client.messages.text({
  to: '15551234567',
  body: 'Hi Jane, your order #12345 has shipped and arrives on March 20.',
  category: MessageCategoryEnum.Utility,
  directSendConfig: { template_name: 'order_shipment_update' },
});

await client.messages.interactiveVoiceCall({
  to: '15551234567',
  body: {
    type: InteractiveTypesEnum.VoiceCall,
    body: { text: 'Call our support team for help with your order.' },
    action: {
      name: 'voice_call',
      parameters: { display_text: 'Call Support', ttl_minutes: 1440 },
    },
  },
});
```

## Example Details
- `category` is accepted by every `client.messages.*` send method and is serialized as the top-level `category` field.
- `directSendConfig` maps to `direct_send_config` and is only applied alongside `category`.
- `interactiveVoiceCall` defaults `category` to `'utility'` because the "Call on WhatsApp" button is a Direct Send–only type.
- The voice call button must be sent on its own — it cannot be combined with CTA URL or reply buttons, and footers are not allowed.
- `display_text` defaults to "Call on WhatsApp" (max 20 characters); `ttl_minutes` accepts 1–43200 and defaults to 10080 (7 days).
- Calling must already be enabled on the phone number (`client.calling.updateCallingSettings` with `calling.status: 'ENABLED'`) and the app subscribed to the `calls` webhook field, otherwise the send fails with error `138000`.
