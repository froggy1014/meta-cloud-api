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

### Click and landing page view webhooks (`user_actions`)
Marketing Messages API for WhatsApp (and Ads Manager) only; both features are in limited availability. Meta reports what a user did with a marketing message as a `messages` field change whose value carries a `user_actions` array instead of `messages` or `statuses` — no subscription beyond `messages` is needed. Register `Whatsapp.processor.onUserAction(...)`; each action arrives as a `ProcessedUserAction` (`wabaId`, `phoneNumberId`, `displayPhoneNumber`, `action`).

- `action.action_type: 'marketing_messages_link_click'` — the user tapped the body or call-to-action. `marketing_messages_link_click_data` carries `click_component` (`cta` | `body`), `product_id` (when assigned in Ads Manager or the Marketing API), `click_id`, and `tracking_token`. Click events are only available for messages sent in the last 7 days.
- `action.action_type: 'landing_page_view'` (documented September 23, 2026) — the tapped link opened its landing page in the WhatsApp In-App Browser, so you can measure users who reached the page, not just those who tapped. `marketing_messages_link_click_data` carries only `click_id` and `tracking_token`; `click_component` and `product_id` are never present. Only tracking links created in the last 7 days produce the event.
- Correlate a landing page view with its click event through `tracking_token`, falling back to `click_id` (shared by both payloads). Either key is **omitted**, not `null`, when unavailable — check for presence. Meta does not guarantee order: the view can arrive before, after, or without its click event, so do not require the click first. When neither key is present, the view cannot be correlated.
- `action_type` is an open enum. The SDK delivers every action to your handler; ignore values you do not recognize rather than treating them as errors.
- `timestamp` is a Unix timestamp in seconds, as a string.

```typescript
Whatsapp.processor.onUserAction(async (wa, { action }) => {
    const data = action.marketing_messages_link_click_data;
    switch (action.action_type) {
        case 'marketing_messages_link_click':
            recordClick(data?.tracking_token ?? data?.click_id, data?.click_component);
            break;
        case 'landing_page_view':
            recordLandingPageView(data?.tracking_token ?? data?.click_id);
            break;
        default:
            // Open enum — Meta may add action types without notice
            break;
    }
});
```

See Meta's [Tracking click events](https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/track-click-events) and [Tracking landing page view events](https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/track-landing-page-views). The separate `tracking_events` webhook field (`onTrackingEvents`) is unchanged.

### Routing template messages by category
Meta's routing guidance (September 24, 2026): pick the send endpoint from the template's **latest** category — `MARKETING` goes through `client.marketingMessages.sendTemplateMessage` (`/marketing_messages`), every other category through `client.messages` (`/messages`).

- Keep a persistent, cached mapping of Messaging account ID, template ID, name, language, and latest category. Seed it from `client.templates.getTemplate(...)` / the template list.
- Update the mapping from `processor.onTemplateCategoryUpdate(...)` using `new_category`, only after the completed notification. Treat `onTemplateCorrectCategoryDetection` (impending change) as monitoring only — do not route on `correct_category`.
- Once the Messaging account is fully onboarded and `disable_marketing_messages_on_cloud_api` is set, `/messages` rejects marketing templates with error `131063`: refresh the category and retry via `/marketing_messages`. If an appeal turns a marketing template into utility, `/marketing_messages` rejects it; refresh and retry via `/messages`. Retry only after a confirmed failure, and make retries idempotent.
- See Meta's [Route template messages by category](https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/route-template-messages). The SDK recognizes `131063` as a send-message error code; routing itself stays in your code.

### Max price (`optimization_spec`)
- Max price is set per template via `optimization_spec` on `client.templates.createTemplate`. It takes `bid_strategy` (only `'LOWEST_COST_WITH_BID_CAP'` is accepted) and `bid_amount`, the maximum price per **1,000** deliveries in the smallest unit of the WABA's currency — multiply the desired per-delivery price by 1,000 after converting it.
- `bid_spec` was the original field name on template create/update; Meta deprecated it on July 31, 2026. The SDK still types it, marked deprecated — use `optimization_spec`.
- Omitting `optimization_spec` leaves the template on standard rate card pricing.
- Since August 31, 2026 an eligible template can be switched between rate card pricing and max price **without creating a new template** — pass `optimization_spec` to `client.templates.updateTemplate(templateId, ...)` (`POST /{TEMPLATE_ID}`). The same call updates the cap on a template that already has one. Approved templates allow up to 100 edits per hour and 2,400 per day.
- Read the current setting back with `client.templates.getTemplate(templateId)`; the response carries `optimization_spec`.
- Templates carrying a max price must be sent through `/marketing_messages`. Sending one through the Cloud API `/messages` endpoint fails with error `131061`; sending one to a BSUID `recipient` fails with error `131062`.
- Meta's recommendation (September 11, 2026): set the template's `bid_amount` to the **highest** price you are willing to pay per 1,000 deliveries, then scale individual sends **down** with `bid_spec.per_message_bid_multiplier`. That gives the delivery system the widest range to optimize against.
- Rollout: Limited Beta since May 15, 2026 — a Solution Partner can enable the max price feature for up to 500 end-businesses (raised from 100 on September 7, 2026). **Open Beta starts October 1, 2026** (announced September 15, 2026): any partner can enable max price and the reach estimation tool for all of their clients, so the per-partner client cap goes away. Max price stays optional through 2026 and becomes generally available — and required in eligible geographies — in Q2 2027. See [Set a max price for marketing messages](https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/pricing). No SDK surface changes with the beta phase: the SDK does not expose end-business enrollment, approved-template duplication at a different max price, or the WABA-level toggle for the WhatsApp Manager max price experience.

### Per-message max price (`bid_spec.per_message_bid_multiplier`)
- `sendTemplateMessage` accepts `bid_spec: { per_message_bid_multiplier }` — a positive float applied to the template's `bid_amount` for that one send, so the max price changes without editing the template. Default is `1`.
- `1.5` raises the effective max price by 50% (template `bid_amount` 2000 becomes 3000 for that message); `0.5` halves it.
- The send call keeps Meta's `bid_spec` object name even though template create/update moved to `optimization_spec`. Meta flags the message-level multiplier as subject to change during the beta.

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

// Scale this one send down to half the template's max price.
await client.marketingMessages.sendTemplateMessage({
  to: '15551234567',
  template: {
    name: 'promo_template',
    language: { code: LanguagesEnum.English_US },
  },
  bid_spec: { per_message_bid_multiplier: 0.5 },
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
- `bid_spec.per_message_bid_multiplier` only takes effect when the template already carries a max price via `optimization_spec`.
