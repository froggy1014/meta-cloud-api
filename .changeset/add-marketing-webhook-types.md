---
"meta-cloud-api": minor
---

feat: add Marketing webhook types

Add TypeScript interfaces for marketing-related webhook fields:
- `automatic_events`: Meta ML-detected lead gen / purchase events from
  Click-to-WhatsApp ads (requires Embedded Signup opt-in)
- `tracking_events`: Message delivery and click tracking events, with
  `events[]` array containing `event_name`, `timestamp`, and `tracking_data`
