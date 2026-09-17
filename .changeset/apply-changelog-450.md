---
'meta-cloud-api': patch
---

Apply Cloud API changelog entry #450 (Calling integration guidance recommends the new account model for sharing one phone number across providers)

- **Sharing one phone number across providers (#450)**: `docs/calling.md` documents Meta's September 16, 2026 guidance update — when a business uses one Solution Partner for messaging and another for calling on the same number, Meta now recommends the new WhatsApp account model (Multi-Solution Conversations) instead of pointing two apps at one WABA. Each partner gets its own shared account, templates, and billing; the calling app subscribes to the `calls` webhook field (`processor.onCalls`) and to `account_update` (`processor.onAccountUpdate`) for the shared-account lifecycle events that `AccountUpdateEvent` already types. Onboarding happens in Embedded Signup and `client.calling.*` is unchanged.

Documentation only; no endpoint, payload, or webhook type changes.
