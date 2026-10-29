# Direct Send

## Overview
Direct Send sends business-initiated utility and authentication messages through the standard messages endpoint without pre-creating a template — Meta generates and matches the template behind the scenes. Add a top-level `category` to any supported message to opt in.

Utility messaging became generally available on July 31, 2026.

Eligibility (updated October 8, 2026): business portfolios with a messaging limit of 100,000 or unlimited are generally eligible for Direct Send utility messaging. WhatsApp Manager shows a banner confirming whether the account is eligible; ineligible accounts can express interest. Direct Send for authentication messages remains in beta by request. See [Direct Send eligibility](https://developers.facebook.com/documentation/business-messaging/whatsapp/direct-send#eligibility).

## Endpoints
- POST /{PHONE_NUMBER_ID}/messages

## Notes
- `category` accepts `'utility'`, `'authentication'`, or `'service'`. Omitting it is equivalent to `'service'` and keeps normal free-form send behavior.
- `'authentication'` is access restricted (beta by request) and cannot be sent to a business-scoped user ID. It supports text messages and, since October 14, 2026, interactive one-time password (OTP) messages with a copy code button: `type: 'interactive'`, `interactive.type: 'button'`, and exactly one `{ type: 'otp', otp: { code, otp_type: 'copy_code', text?, code_expiration_minutes? } }` button (typed as `OtpButtonObject`). `code` is 4 to 10 ASCII alphanumeric characters and must also appear as a standalone value in `interactive.body.text`; `text` defaults to "Copy Code" (max 25 characters); `code_expiration_minutes` is 1 to 90 and defaults to 10. `client.messages.interactiveOtp` sends it with `category: 'authentication'` by default.
- Text authentication messages no longer get an OTP copy code button by default (deprecated October 27, 2026): Direct Send does not infer an OTP from a `type: 'text'` body or add a copy code button automatically. To show a copy code button, send an interactive OTP message (`client.messages.interactiveOtp`) and pass the code explicitly in `otp.code`. Plain text authentication messages still send, without the button.
- Supported utility formats: text, CTA URL buttons, reply buttons, mixed buttons (10 total, max 2 CTA), image/video/document headers, custom TTL, and the voice call button.
- Not supported: marketing messages, PSTN phone number buttons, address, audio, contacts, location, sticker, and reaction messages.
- `preview_url` is ignored — Direct Send messages do not render a URL preview.
- `directSendConfig.template_name` pins message-to-template attribution (utility only). Names must match `^[a-z0-9_]+$` and be unique within the WABA.
- The message-status webhook carries an extra `template_id` field for Direct Send messages.
- Message pacing (October 15, 2026): Direct Send messages are subject to business portfolio pacing. A paced message may be held and delivered later, or dropped. Outcomes are reported only through `messages` status webhooks, never on the send response: a dropped message arrives as `status: 'failed'` with error code `135000` in `errors`. A send that returns `message_status: 'accepted'` is therefore not a delivery guarantee; subscribe to the `messages` webhook field and handle `135000` in `onStatus`. `135000` is already in `WHATSAPP_ERROR_CODES`. See Meta's [Message pacing](https://developers.facebook.com/documentation/business-messaging/whatsapp/direct-send/supported-features-and-limits#message-pacing).
- Sending a `category` from an ineligible WABA returns error `100` with `error_data.details` "Parameter Invalid: The 'category' value requires Direct Send, which isn't enabled for this account. Use an approved message template instead."

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

await client.messages.interactiveOtp({
  to: '15551234567',
  body: {
    type: InteractiveTypesEnum.Button,
    body: { text: 'Your verification code is 123456.' },
    action: {
      buttons: [{ type: 'otp', otp: { code: '123456', otp_type: 'copy_code', code_expiration_minutes: 10 } }],
    },
  },
});
```

## Example Details
- `category` is accepted by every `client.messages.*` send method and is serialized as the top-level `category` field.
- `directSendConfig` maps to `direct_send_config` and is only applied alongside `category`.
- `interactiveVoiceCall` defaults `category` to `'utility'` because the "Call on WhatsApp" button is a Direct Send–only type.
- `interactiveOtp` defaults `category` to `'authentication'`; the OTP copy code button is only valid on Direct Send authentication messages, which must contain exactly that one button.
- The voice call button must be sent on its own — it cannot be combined with CTA URL or reply buttons, and footers are not allowed.
- `display_text` defaults to "Call on WhatsApp" (max 20 characters); `ttl_minutes` accepts 1–43200 and defaults to 10080 (7 days).
- Calling must already be enabled on the phone number (`client.calling.updateCallingSettings` with `calling.status: 'ENABLED'`) and the app subscribed to the `calls` webhook field, otherwise the send fails with error `138000`.
