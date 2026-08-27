---
'meta-cloud-api': minor
---

Apply August 2026 Cloud API changelog entries (#424–#426, #430, #433)

- **Contact Book API** (new `contactBook` module): `deleteEntry({ bsuid })` removes a user's phone-number/BSUID pairing from the Meta-hosted contact book via `DELETE /{PHONE_NUMBER_ID}/contact_book`. Adds the `DeleteContactBookEntryParams` and `DeleteContactBookEntryResponse` types.
- **BSUID identity system messages**: `SystemMessage.system` gains `user_id` and `parent_user_id`, and its `type` now covers `user_changed_number`, `user_identity_changed`, and `user_changed_user_id`. `SystemChangeTypesEnum` / `SystemChangeTypes` gain `UserChangedNumber`, `UserIdentityChanged`, and `UserChangedUserId`; the old `customer_changed_number` / `customer_identity_changed` members are deprecated but still exported. There is no subscribable `user_id_update` webhook field — BSUID changes arrive as these system messages on the `messages` field.
- **user_preferences webhook**: `UserPreferenceEntry` gains `parent_user_id` and accepts `'resume'` alongside `'stop'`; `UserPreferencesContact` gains `parent_user_id`. Preferences are always scoped to the individual BSUID and are never applied at the parent BSUID level.
- **Marketing Messages BSUID sends**: `sendTemplateMessage` accepts `recipient` (user BSUID or parent BSUID) in place of `to`. Exactly one of the two is required; passing both or neither throws a `WhatsAppValidationError`.
- **Template max price**: `TemplateRequestBody` gains `bid_spec` (`{ bid_amount }`, the max price per 1,000 deliveries in the WABA currency's smallest unit) plus the new `TemplateBidSpec` type. Adds error codes `131061` (bid_spec template sent through the Cloud API) and `131062` (bid_spec template sent to a BSUID recipient) to `WHATSAPP_ERROR_CODES` and `SEND_MESSAGE_ERROR_CODES`.

Type-level breaking change: `UserPreferenceEntry.wa_id` and `UserPreferenceEntry.user_id` are now optional, since BSUID-only payloads may omit either. Readers of those fields need a null check.
