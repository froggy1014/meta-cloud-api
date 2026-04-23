---
"meta-cloud-api": minor
---

feat: expand existing webhook type definitions

Update existing webhook type files based on official Meta API docs:
- `account.ts`: Expand `account_update` with 10 new event types
  (ACCOUNT_OFFBOARDED, PARTNER_CLIENT_CERTIFICATION_STATUS_UPDATE,
  VOLUME_BASED_PRICING_TIER_UPDATE, etc.) and add
  `account_settings_update` with phone number calling configuration
- `business.ts`: Add `business_status_update` webhook type
- `messageEchoes.ts`: Add `message_echoes` types (distinct from
  `smb_message_echoes`)
- `template.ts`: Add `message_template_components_update` and
  `template_correct_category_detection` webhook types
