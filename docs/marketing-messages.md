# Marketing Messages API

## Overview
Send marketing template messages via `/marketing_messages`.

## Endpoints
- POST /{PHONE_NUMBER_ID}/marketing_messages

## Notes
- Only marketing templates are supported on this endpoint.
- Address the user by phone number (`to`) **or** by business-scoped user ID (`recipient`) — exactly one is required. `recipient` accepts a user BSUID or a parent BSUID.
- `message_activity_sharing` controls message analytics sharing.
- `product_policy` accepts `'CLOUD_API_FALLBACK'` or `'STRICT'`.

### Max price (`bid_spec`)
- Max price is set per template, at creation time, via `bid_spec.bid_amount` on `client.templates.createTemplate`. `bid_amount` is the maximum price per **1,000** deliveries, in the smallest unit of the WABA's currency — multiply the desired per-delivery price by 1,000 after converting it.
- Omitting `bid_spec` leaves the template on standard rate card pricing.
- Templates carrying `bid_spec` must be sent through `/marketing_messages`. Sending one through the Cloud API `/messages` endpoint fails with error `131061`; sending one to a BSUID `recipient` fails with error `131062`.
- Limited Beta: a Solution Partner can enable the max price feature for up to 100 end-businesses (raised from 15 on July 31, 2026). Enabling end-businesses, duplicating an approved template at a different max price, and the WABA-level toggle for the WhatsApp Manager max price experience are not in the public reference yet, so the SDK does not expose them.

## Example
```ts
import WhatsApp, { CategoryEnum, LanguagesEnum } from 'meta-cloud-api';

const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID!,
});

// Optional: cap the price at $0.25 per delivery — 25000 cents per 1,000 deliveries.
await client.templates.createTemplate({
  name: 'promo_template',
  language: LanguagesEnum.English_US,
  category: CategoryEnum.Marketing,
  bid_spec: { bid_amount: 25000 },
  components: [{ type: 'BODY', text: 'Our summer sale starts today.' }],
});

await client.marketingMessages.sendTemplateMessage({
  to: '15551234567',
  template: {
    name: 'promo_template',
    language: { code: LanguagesEnum.English_US },
  },
  message_activity_sharing: true,
});

// Same send, addressed by BSUID instead of phone number.
await client.marketingMessages.sendTemplateMessage({
  recipient: 'US.13491208655302741918',
  template: {
    name: 'promo_template',
    language: { code: LanguagesEnum.English_US },
  },
});
```

## Example Details
- `sendTemplateMessage` requires `template.name` with `language.code`, plus exactly one of `to` or `recipient`; passing both or neither throws a `WhatsAppValidationError`.
- `message_activity_sharing` toggles analytics sharing for the message.
