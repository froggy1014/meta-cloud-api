---
'meta-cloud-api': minor
---

Apply Cloud API changelog entries #444-#446 (October 1, 2026 pricing webhook values, calling rate cards, coexistence onboarding)

- **Status webhook pricing (#444)**: `StatusWebhook['pricing'].type` adds `free_group_customer_service`, and `.category` adds `group_marketing`, `group_service`, `group_utility`, and the hyphenated `authentication-international` that Meta documents for the pricing category (the underscored `authentication_international` is kept for payloads that still send it). Inline docs record the October 1, 2026 meaning shifts — `free_customer_service` becomes a 1:1 service delivery inside the free tier, `free_group_customer_service` the group equivalent, and `regular` absorbs utility messages inside customer service windows plus service messages past the free tier — and Meta's deprecation of `pricing.billable` in favor of `type` + `category`.
- **Docs**: `docs/messages.md` gains a status webhook pricing section for the October 1, 2026 change; `docs/calling.md` records the Calling API rate cards effective October 1, 2026 (#445), where 9 markets become standalone entries at the rate of the region they leave; `docs/registration.md` documents coexistence onboarding on the new account model (#446) — the converted Messaging account keeps its ID in `waba_id`, and partners must subscribe to `account_update` for lifecycle events on both shared accounts.

Entries #445 and #446 are billing data and onboarding integration changes; `AccountUpdateEvent` already covers the coexistence lifecycle events, so neither needs an endpoint, payload, or webhook type change.
