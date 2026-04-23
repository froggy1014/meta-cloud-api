---
"meta-cloud-api": minor
---

feat: add Group API webhook types

Add TypeScript interfaces for all four group lifecycle webhook fields:
- `group_lifecycle_update` (group_create, group_delete)
- `group_participants_update` (add, remove, join requests)
- `group_settings_update` (subject, description, profile picture)
- `group_status_update` (suspend, suspend_cleared)

All types are based on official Meta webhook sample payloads.
