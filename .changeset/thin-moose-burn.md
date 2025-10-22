---
'meta-cloud-api': patch
---

Enhanced type exports for improved type inference in onMessage webhook handler

**Changes:**
- Exported all specific message type interfaces (TextMessage, ImageMessage, VideoMessage, etc.) from the main package
- Exported discriminated union types for webhook values (MessageWebhookValue, StatusWebhookValue, ErrorWebhookValue)
- Exported complete webhook payload types (WebhookValue, StatusWebhook, WebhookPayload)

**Benefits:**
- Better TypeScript IntelliSense when working with `onMessage` callback parameters
- Proper type narrowing based on message type discriminators
- Users can now import and use specific message types for type annotations
- Improved developer experience with autocomplete for all message properties

**Example:**
```typescript
import { TextMessage, ImageMessage, WhatsAppMessage } from 'meta-cloud-api';

client.onMessage((message: WhatsAppMessage) => {
  if (message.type === 'text') {
    // TypeScript now knows this is a TextMessage
    console.log(message.text.body);
  } else if (message.type === 'image') {
    // TypeScript now knows this is an ImageMessage
    console.log(message.image.id);
  }
});
```

**Migration:**
No breaking changes - existing code continues to work. The new exports simply provide better type support for developers who want explicit type annotations.
