---
'meta-cloud-api': minor
---

Apply June 2026 Cloud API changelog entries (#411–#418)

- **Username API** (`phoneNumbers`): new `getUsername`, `updateUsername`, `deleteUsername`, and `getUsernameSuggestions` methods with `transfer_action` (`'none' | 'force_transfer'`) support, plus the new `147005` error code (username transfer required) in `WHATSAPP_ERROR_CODES`.
- **Calling API**: per-call `recording` and `transcription` configuration on `initiateCall` and `acceptCall`, and new `call_recording_available` / `call_transcription_available` webhook events with `call_recording` / `call_transcript` payload types.
- **SIP call webhooks**: new `call_created` call event type; business-scoped user ID fields (`from_user_id`, `from_parent_user_id`) on call entries.
- **Coexistence webhooks**: new `edit` and `revoke` message webhook types (`EditMessage`, `RevokeMessage`) with business-scoped user ID fields, and matching `MessageTypesEnum.Edit` / `MessageTypesEnum.Revoke` members.
