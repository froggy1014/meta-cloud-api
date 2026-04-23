---
"meta-cloud-api": minor
---

feat: add handlers for 17 missing webhook fields

Wire up handlers for all previously unsupported webhook fields in
`WebhookProcessor` and `processWebhookMessages`:

Groups: group_lifecycle_update, group_participants_update,
group_settings_update, group_status_update

Calls: calls

Account: account_settings_update

Business: business_status_update

Marketing: automatic_events, tracking_events

Messaging: message_echoes, messaging_handovers, standby, user_preferences

Template: message_template_components_update,
template_correct_category_detection

Partner/Payment: partner_solutions, payment_configuration_update

Each field has a corresponding on*() registration method and
type-safe handler/processed types.
