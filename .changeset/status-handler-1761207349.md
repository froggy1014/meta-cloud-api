---
"meta-cloud-api": patch
---

Add dedicated status handler with improved type system

**New Feature:**
- Add `onStatus(handler)` method to WebhookProcessor for handling status updates
- Introduce new types: `ProcessedMessage`, `ProcessedStatus`, `StatusHandler`

**Breaking Change:**
- `MessageTypesEnum.Statuses` is now deprecated
- Using `onMessage(MessageTypesEnum.Statuses, handler)` will throw an error
- Migrate to `onStatus(handler)` for better type safety

**Migration:**
```typescript
// Before (deprecated)
processor.onMessage(MessageTypesEnum.Statuses, (whatsapp, message) => {
  // handle status
});

// After (recommended)
processor.onStatus((whatsapp, processed) => {
  // processed.status: StatusWebhook
  console.log(processed.status);
});
```
