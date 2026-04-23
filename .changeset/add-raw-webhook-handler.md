---
"meta-cloud-api": minor
---

feat: add onRaw handler with WebhookField filter support

Add `onRaw(handler, fields?)` to `WebhookProcessor` for bypassing raw
Meta webhook payloads to external URLs while preserving the original
`WebhookPayload` interface.

When `fields` is provided, only matching `entry.changes` entries are
forwarded; if no changes match, the handler is skipped entirely.

Add `WebhookField` as-const object and `WebhookFieldType` union type
for type-safe field filtering, covering all 32 supported webhook fields.

```ts
import { WebhookField } from 'meta-cloud-api';

processor.onRaw(async (whatsapp, payload) => {
    await fetch('https://your-service.com/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
}, [WebhookField.AccountUpdate, WebhookField.Calls]);
```
