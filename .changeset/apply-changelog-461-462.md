---
'meta-cloud-api': minor
---

Apply Cloud API changelog entries #461-#462 (landing page view webhook, service message exemptions)

- **Landing page view webhook (#461)**: Added `WebhookProcessor.onUserAction(handler)` / `offUserAction()` for the `user_actions` array Meta delivers on the `messages` webhook field for Marketing Messages API traffic. New types `UserActionsWebhookValue` (added to the `WebhookValue` union), `UserAction`, `UserActionType` (open enum: `marketing_messages_link_click`, `landing_page_view`), `MarketingMessagesLinkClickData`, `ProcessedUserAction`, and `UserActionHandler`. `processWebhookMessages` previously ignored these payloads; it now dispatches every action (including unknown `action_type` values) to the registered handler. Documented click/landing-page-view correlation rules in `docs/marketing-messages.md`.
- **Service message exemptions (#462)**: `docs/messages.md` and the `StatusWebhook['pricing']['type']` JSDoc note that from October 1, 2026 reaction messages are never charged and do not count toward the 1,000 free monthly service messages, and that eligible governments and non-profits keep service messages free beyond the tier through December 31, 2027. Billing policy only; no endpoint, payload, or webhook type change.
