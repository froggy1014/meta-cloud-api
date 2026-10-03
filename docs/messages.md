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

## Status webhook pricing (October 1, 2026)
Meta's October 1, 2026 service and utility pricing change (documented September 10, 2026) adds values and shifts meanings on the `pricing` object of a `messages` status webhook. `StatusWebhook['pricing']` carries them:

- `pricing.type` gains `free_group_customer_service`, alongside `regular`, `free_customer_service`, and `free_entry_point`.
- From October 1, 2026, `free_customer_service` means a 1:1 service delivery inside the business phone number's **free tier** — not a utility message inside a customer service window. `free_group_customer_service` moves the same way for group service deliveries.
- From October 1, 2026, `regular` also covers 1:1 utility messages inside an open customer service window, group utility messages inside an open group customer service window, and 1:1 and group service messages sent after the free tier is used up.
- `pricing.category` gains `group_marketing`, `group_service`, and `group_utility` for Groups API traffic, plus the hyphenated `authentication-international` spelling Meta documents for the pricing category (the underscored `authentication_international` is kept for payloads that still send it, and stays the spelling of `conversation.origin.type`).
- `pricing.billable` is deprecated by Meta in a future versioned release. Branch on `pricing.type` and `pricing.category` instead.

The free tier that drives those values (documented September 10, 2026): each business phone number gets one shared allowance of **1,000 delivered service messages per month**. A 1:1 delivery consumes one unit, a group send one unit per delivered recipient, and the allowance does not roll over. Inside the tier a delivery arrives as `type: 'free_customer_service'` / `category: 'service'` (or `type: 'free_group_customer_service'` / `category: 'group_service'`); once it is used up the same traffic arrives as `type: 'regular'` with the category unchanged. The same `regular` shift applies from October 1, 2026 to utility and group utility messages sent inside an open customer service window. Meta's pricing analytics values (`pricing_types`, `pricing_categories` on `pricing_analytics`) are unchanged by this update, and the SDK does not type that field.

Free entry point (FEP) windows (updated September 28, 2026): when a WhatsApp user messages you from an ad that clicks to WhatsApp (Android or iOS app only) and you reply inside the customer service window, an FEP window opens from the time of your reply. It may now stay open for **up to 7 days** instead of 72 hours. While it is open every message type is free and arrives with `pricing.type: 'free_entry_point'`. The window is tracked per business and user pair, so every Messaging account sending on the same business phone number shares it. The customer service window a user opens by messaging you is unchanged. Do not hard-code a 72-hour FEP expiry; rely on the status webhook instead (on v24.0+ the `conversation` object, with its optional `expiration_timestamp`, is only included for messages sent inside an open FEP window). Billing change only — no endpoint, payload, or webhook type change.

Meta Business Agent message analytics (documented September 28, 2026): non-template messages are either service messages (`pricing.category: 'service'`, counted by querying `pricing_analytics` with `pricing_category: SERVICE`) or Meta Business Agent messages, which Meta bills per message with one token-based charge. Usage and charges for Meta Business Agent messages are reported by Meta's [Business Agent Usage Insights API](https://developers.facebook.com/documentation/meta-business-agent/reference/insights/business-agent-usage-insights), not by `pricing_analytics`. That API belongs to the separate Meta Business Agent Platform: `GET https://api.facebook.com/{entity_id}/business_agent_insights` with the billable account ID from Billing Hub, an `X-API-Version` header, and a token with `business_management`. It returns `billable_messages`, `billable_tokens`, and `cost` per HOUR, DAY, or MONTH bucket. It is not on the Graph API host this SDK calls, so the SDK does not wrap it. Meta has not documented a status webhook `pricing.category` value for Meta Business Agent messages; handle unknown categories with a default branch.

Service message exemptions (documented September 29, 2026): from October 1, 2026 a **reaction message** is the only service message type that stays free for every business, and reactions do not count toward the 1,000 free monthly service messages per business phone number. Separately, **eligible governments and non-profits** keep service messages free beyond the monthly free tier from October 1, 2026 through December 31, 2027 — government departments and agencies, inter-governmental organizations, and community non-profits (public health, crisis response, disaster relief, non-partisan civic engagement). For organizations Meta has already identified as eligible the policy applies from 12am on October 1, 2026 in the WhatsApp Business account's timezone; AI Providers are charged under their own policy instead. Eligibility is decided by Meta, not set through the API, and Meta has not documented a distinct status webhook `pricing.type` for exempt deliveries, so do not infer eligibility from the webhook. Billing policy only — no SDK endpoint, payload, or webhook type change.

Pricing page restructure (documented September 30, 2026): Meta rewrote [Pricing on the WhatsApp Business Platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/) around the rates and policies effective October 1, 2026 (by Messaging account timezone). The page now opens with a summary table per message category, then covers what Meta charges for, when it does not charge (free entry point window, monthly free tier of service messages), and volume tiers; earlier rate and policy updates moved under *Prior updates to pricing and rates*. The rate card table gained a *Launched in 2026?* column and offers list rates (CSV), utility/authentication volume tiers (CSV), and combined rates and volume tiers (PDF) for all 16 supported currencies. The previous page is archived as *Pricing (deprecated)*, and existing deep links resolve to the matching section of the new page. Rates are not exposed by any Graph API endpoint this SDK wraps; read them from the rate cards and reconcile charges with `pricing_analytics`.

Switch exhaustively on `pricing.type`/`pricing.category` only with a default branch — Meta adds values without a version bump.

See Meta's [status messages webhook reference](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/status/). Type-only change; no endpoint or request payload change.

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
