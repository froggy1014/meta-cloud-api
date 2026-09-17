---
'meta-cloud-api': patch
---

Apply Cloud API changelog entries #447-#449 (service message free tier, max price Open Beta, category review clarification)

- **Service message free tier (#447)**: `docs/messages.md` records the free tier behind the October 1, 2026 status webhook pricing values — one shared allowance of 1,000 delivered service messages per business phone number per month, drawn on by both 1:1 and group deliveries, with no roll-over. Inside the tier a delivery reports `free_customer_service` / `free_group_customer_service`; past it the same traffic reports `regular`. `StatusWebhook['pricing']` already carries every value (added in #444), and Meta's `pricing_analytics` values are unchanged.
- **Max price Open Beta (#448)**: `docs/marketing-messages.md` records the rollout phases — Open Beta on October 1, 2026 removes the 500 end-business per-partner cap of the Limited Beta, max price stays optional through 2026, and it becomes generally available (and required in eligible geographies) in Q2 2027. `optimization_spec` and `bid_spec.per_message_bid_multiplier` are unchanged.
- **Category review clarification (#449)**: `docs/templates.md` documents that a template whose category was confirmed by a review remains subject to automatic category updates, and points at the `template_correct_category_detection` and `template_category_update` webhook handlers the SDK already exposes.

Documentation only; no endpoint, payload, or webhook type changes.
