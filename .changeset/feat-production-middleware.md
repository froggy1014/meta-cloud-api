---
"meta-cloud-api": minor
---

feat: add production middleware layer (retry, validation, tests)

**Retry/Exponential Backoff**
- New `retry` option in `WhatsAppConfig` for automatic retry on throttling errors
- `WhatsAppThrottlingError` triggers retry with exponential backoff (1s → 2s → 4s)
- Configurable `maxAttempts` (default: 3), `backoff`, and `initialDelayMs`

**Input Validation**
- New `WhatsAppValidationError` for client-side validation errors
- `assertPhoneNumber()` validates E.164 format on all `messages.*` calls
- `assertNonEmpty()` validates arrays in `blockUsers.block/unblock` and `groups.removeParticipants`

**Tests**
- Added unit tests for `blockUsers` module (was the only untested module)
- Added tests for `validate.ts` utility functions
- Added retry loop integration tests

**README**
- Updated webhook example with real API usage and correct export names
