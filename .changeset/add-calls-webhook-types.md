---
"meta-cloud-api": minor
---

feat: add Calls webhook types

Add TypeScript interfaces for the `calls` webhook field, based on the
official Meta webhook sample payload. Includes `CallEntry` with all
lifecycle event types (connect, call_status, media_update, terminate),
`CallsValue` with metadata and contacts, and supporting enums.
