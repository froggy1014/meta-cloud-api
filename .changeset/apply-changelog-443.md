---
'meta-cloud-api': minor
---

Apply Cloud API changelog entry #443 (per-message max price multiplier)

- **Marketing Messages send-time max price**: `sendTemplateMessage` accepts `bid_spec: { per_message_bid_multiplier }`, a positive float that scales the template's `bid_amount` for a single send without editing the template (`1.5` raises the effective max price 50%, `0.5` halves it, default `1`). Adds the `MarketingMessageBidSpec` type. Meta keeps the `bid_spec` object name on the send call even though template create/update moved to `optimization_spec`, and flags the message-level multiplier as subject to change during the beta.
- **Docs**: `docs/marketing-messages.md` records Meta's September 11, 2026 recommendation — set the template's `bid_amount` to the highest acceptable price and scale individual messages down with the multiplier.

Entry #442 (WhatsApp Manager max price experience) is a WhatsApp Manager UI guide with no API surface; no SDK change.
