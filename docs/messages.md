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
- Add `category: 'utility' | 'authentication'` to send business-initiated messages without a pre-approved template. See [Direct Send](./direct-send.md).

## Prepaid billing (India)
Accounts in India that fund a WhatsApp Business account by UPI are on prepaid billing (documented September 8, 2026). Funding and balance live in the Billing Hub — there is no API to add funds or read the balance — but the send path behaves differently:

- A send that fails the funds check is rejected either as an error on the send call **or** as a `messages` status webhook with `status: 'failed'`. Handle both; the send call can still return `message_status: 'accepted'`.
- Treat `accepted` as queued, not delivered. Subscribe to the `messages` webhook field before sending on a prepaid account, or a funds rejection has nowhere to be delivered.
- Error `131042` (Business eligibility payment issue) means the payment-eligibility check failed; an insufficient balance is only one possible cause. Do not parse `error_data.details` to detect it — the text is the same for a missing, invalid, or underfunded payment method.
- Error `130429` (Rate limit hit) is a rate-limit response, not a balance signal. Back off and retry; the SDK already treats it as throttling and retries with backoff.
- Both codes are in `WHATSAPP_ERROR_CODES`; use `isMetaError` plus the code to branch. Back off rather than retrying in a tight loop, and reconcile billing against `sent`/`delivered` statuses instead of `accepted`.

See Meta's [Prepaid billing guide](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/prepaid-billing/). No SDK endpoint or payload change; this is send-path error handling only.

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
