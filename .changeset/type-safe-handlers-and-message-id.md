---
'meta-cloud-api': minor
---

## Features

### Type-Safe Specialized Handlers
Add 13 specialized handler methods for better type safety and developer experience:
- `onText()`, `onImage()`, `onVideo()`, `onAudio()`, `onDocument()`, `onSticker()`
- `onInteractive()`, `onButton()`, `onLocation()`, `onContacts()`
- `onReaction()`, `onOrder()`, `onSystem()`

These methods provide automatic type narrowing, eliminating the need for optional chaining.

**Example:**
```typescript
bot.processor.onText(async (whatsapp, processed) => {
  const { message } = processed;
  console.log(message.text.body); // ✅ No optional chaining needed!
});
```

### Consistent Message ID Access
Add `messageId` property to `ProcessedMessage` type for consistent message ID access across all message types:
- Automatically extracts ID from the correct location based on message type
- For most messages: uses `message.id`
- For interactive/button replies (e.g., `nfm_reply`): uses `message.context.id`

**Example:**
```typescript
bot.processor.onMessagePreProcess(async (whatsapp, processed) => {
  // Works for all message types, including nfm_reply
  await whatsapp.messages.markAsRead({ messageId: processed.messageId });
});
```

### Flow Response Support
Add support for WhatsApp Flow responses (`nfm_reply` message type):
- New `InteractiveNfmReplyMessage` type for Flow response messages
- Proper type definitions for Flow webhook data

## Documentation
- Update README with comprehensive examples of specialized handlers
- Add examples showing messageId usage across different message types
- Document TypeScript discriminated union approach for type narrowing
