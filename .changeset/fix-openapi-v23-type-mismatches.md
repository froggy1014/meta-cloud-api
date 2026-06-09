---
"meta-cloud-api": patch
---

Fix request/response types to match OpenAPI v23 spec

- EncryptedMessageRequest: use `encrypted_contents` instead of `to`/`jwe`
- MessageHistory events: use `status_filter` query param instead of `delivery_status`
- WABA assigned_users: add required `business` param, make `tasks` required
- SharePreVerifiedPhoneNumber: rename `preverified_phone_number_id` to `preverified_id`
- SetSolutionMigrationIntent: rename `intent` to `migration_intent`, add required fields
- UpdatePhoneNumberStatus: rename `status` to `connection_status`
