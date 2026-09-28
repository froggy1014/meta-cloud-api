---
'meta-cloud-api': minor
---

Apply Cloud API changelog entries #454-#458 (Conversation Routing thread control, business username webhook, template routing guidance)

- **Thread control (#455, #458)**: new `client.threadControl` with `pass`, `release`, and `take` for `POST /{PHONE_NUMBER_ID}/thread_control`. Responses type `request_id` for support. `messaging_handovers` webhook types now carry `type` (`control_passed`/`control_taken`), `control_taken`, `previous_owner_role`/`new_owner_role`, and `conversation_context`; incoming message handlers expose `processed.conversationContext`. See `docs/conversation-routing.md`.
- **Business username updates (#457)**: new `business_username_updates` webhook field with `processor.onBusinessUsernameUpdates`, including the `context: 'revoked'` value for Meta revocations.
- **Template routing (#456)**: `docs/marketing-messages.md` documents routing sends by latest template category; error `131063` is recognized as a send-message error.
- **Onboarding and SIP (#454)**: documented the new account model Phase 1 rollout dates and SIP mTLS client certificate guidance.
