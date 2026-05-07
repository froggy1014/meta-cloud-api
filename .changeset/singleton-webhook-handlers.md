---
"meta-cloud-api": minor
---

Add singleton caching to webhook framework handlers and handler removal methods

- **Singleton caching**: `expressWebhookHandler`, `nextjsPagesWebhookHandler`, and `nextjsAppWebhookHandler` now cache instances per `phoneNumberId`. Repeated calls with the same config return the cached instance, preventing duplicate handler registration during Next.js HMR re-evaluation.
- **`destroy()` method**: All framework handlers now expose a `destroy()` method to clear the cached instance and remove all registered handlers.
- **Handler removal**: `WebhookProcessor` now provides `offMessage()`, `offMessagePreProcess()`, `offMessagePostProcess()`, `offStatus()`, `offRaw()`, `offFlow()`, and `removeAllHandlers()` methods for handler cleanup.
