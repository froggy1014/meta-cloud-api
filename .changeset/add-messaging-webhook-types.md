---
"meta-cloud-api": minor
---

feat: add Messaging handover webhook types

Add TypeScript interfaces for messaging handover webhook fields:
- `messaging_handovers`: WhatsApp handover protocol events with
  `control_passed`, `sender`, and `recipient` fields
- `standby`: Delivered when the app is not the current thread owner
- `user_preferences`: User opt-out events with `user_preferences[]`
  array containing category, value ("stop"), and contact profile info
