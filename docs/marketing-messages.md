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

### Max price (`optimization_spec`)
- Max price is set per template via `optimization_spec` on `client.templates.createTemplate`. It takes `bid_strategy` (only `'LOWEST_COST_WITH_BID_CAP'` is accepted) and `bid_amount`, the maximum price per **1,000** deliveries in the smallest unit of the WABA's currency — multiply the desired per-delivery price by 1,000 after converting it.
- `bid_spec` was the original field name on template create/update; Meta deprecated it on July 31, 2026. The SDK still types it, marked deprecated — use `optimization_spec`.
- Omitting `optimization_spec` leaves the template on standard rate card pricing.
- Since August 31, 2026 an eligible template can be switched between rate card pricing and max price **without creating a new template** — pass `optimization_spec` to `client.templates.updateTemplate(templateId, ...)` (`POST /{TEMPLATE_ID}`). The same call updates the cap on a template that already has one. Approved templates allow up to 100 edits per hour and 2,400 per day.
- Read the current setting back with `client.templates.getTemplate(templateId)`; the response carries `optimization_spec`.
- Templates carrying a max price must be sent through `/marketing_messages`. Sending one through the Cloud API `/messages` endpoint fails with error `131061`; sending one to a BSUID `recipient` fails with error `131062`.
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
const promo = await client.templates.createTemplate({
  name: 'promo_template',
  language: LanguagesEnum.English_US,
  category: CategoryEnum.Marketing,
  optimization_spec: { bid_strategy: 'LOWEST_COST_WITH_BID_CAP', bid_amount: 25000 },
  components: [{ type: 'BODY', text: 'Our summer sale starts today.' }],
});

// Switch an eligible template onto max price, or raise the cap, in place.
await client.templates.updateTemplate(promo.id, {
  optimization_spec: { bid_strategy: 'LOWEST_COST_WITH_BID_CAP', bid_amount: 40000 },
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
