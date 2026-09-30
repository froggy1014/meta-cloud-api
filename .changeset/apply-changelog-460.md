---
'meta-cloud-api': patch
---

Apply Cloud API changelog entry #460 (Meta Business Agent usage analytics)

- **Meta Business Agent analytics (#460)**: `docs/messages.md` documents that Meta Business Agent message usage (billable messages, billed tokens, cost) comes from Meta's Business Agent Usage Insights API on the Meta Business Agent Platform host, while service messages stay on `pricing_analytics`. The 7-day free entry point window in the same entry was already documented for #459. No endpoint, payload, or webhook type change.
