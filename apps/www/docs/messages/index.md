---
sidebar_position: 3
---

# Messages

The WhatsApp API allows you to send various types of messages to your customers. This section covers all available message types and usage patterns.

## Available Message Types

- [Text Messages](./text) - Send simple text messages
- [Image Messages](./image) - Send image files
- [Audio Messages](./audio) - Send audio files including voice notes
- [Video Messages](./video) - Send video content 
- [Document Messages](./document) - Send PDF, spreadsheets, and other document files
- [Sticker Messages](./sticker) - Send static or animated stickers
- [Location Messages](./location) - Share geographic locations
- [Contact Messages](./contact) - Share contact information
- [Template Messages](./template) - Send pre-approved message templates
- [Reaction Messages](./reaction) - React to messages with emojis
- [Interactive Messages](./interactive) - Send interactive elements like buttons and lists

## Key Concepts

For general messaging concepts and operations, check these guides:

- [Messaging Guide](../messaging-guide) - Learn about replying to messages, marking messages as read, and error handling

## Basic Message Structure

All WhatsApp messages share a common structure, with various properties depending on the message type. The basic principles apply across all message types:

```typescript
// A simple example showing the common pattern
const response = await whatsapp.messages.MESSAGETYPE(
  // Message-specific content object
  { ... },
  
  // Recipient's phone number with country code
  15551234567,
  
  // Optional: Message ID to reply to (for threaded conversations)
  replyMessageId
);
```

## Related Documentation

- [Media API](../media-api.md) - For uploading and managing media files
- [Webhooks](../webhooks.md) - For receiving and processing incoming messages 