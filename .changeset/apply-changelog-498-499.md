---
'meta-cloud-api': minor
---

Apply Cloud API changelog entries #498-#499: send messages and place or query calls by business-scoped user ID (`recipient`, with `to` now optional) across `messages.*` and `calling.initiateCall` / `calling.getCallPermissions`, add BSUID fields to call webhook types, add the `CALLING_TIER_UPDATE` account update event with `calling_limit_info`, and map error `138037` (business-initiated calling limit reached) to `WhatsAppCallingError`.
