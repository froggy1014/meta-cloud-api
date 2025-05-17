---
sidebar_position: 3
---

# Messages API

The WhatsApp Cloud API enables you to programmatically send various message types to your customers. This documentation covers all available message types and their implementation.

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

All WhatsApp messages follow a common structure with parameters that vary by message type:

```typescript
// Common pattern for sending messages
const response = await whatsapp.messages.MESSAGETYPE({
  // Message content object (varies by message type)
  body: {
    // Message-specific properties
  },
  // Recipient's phone number with country code
  to: "1234567890",
  // Optional: Message ID to reply to
  replyMessageId: "wamid.HEX_MESSAGE_ID"
});
```

## Media Handling

The API supports two methods for sending media:

1. **Meta-hosted Media** - Upload media to Meta's servers first and reference by ID:

   ```typescript
   // Using a previously uploaded media ID
   await whatsapp.messages.image({
     body: {
       id: "1234567890",
       caption: "Product image"
     },
     to: "1234567890"
   });
   ```

2. **Externally-hosted Media** - Reference media files from your servers:

   ```typescript
   // Using an externally hosted URL
   await whatsapp.messages.image({
     body: {
       link: "https://example.com/images/product.jpg",
       caption: "Product image"
     },
     to: "1234567890"
   });
   ```

## Message Management

### Threaded Conversations

Create threaded replies by specifying a previous message ID:

```typescript
await whatsapp.messages.text({
  body: "This is a reply to your question",
  to: "1234567890",
  replyMessageId: "wamid.HEX_MESSAGE_ID"
});
```

### Marking Messages as Read

Let customers know you've seen their messages:

```typescript
await whatsapp.messages.markAsRead({
  messageId: "wamid.HEX_MESSAGE_ID"
});
```

### Showing Typing Indicators

Display typing indicators to provide a more realistic conversation experience:

```typescript
await whatsapp.messages.showTypingIndicator({
  messageId: "wamid.HEX_MESSAGE_ID"
});
```

## Handling Incoming Messages

To receive and respond to customer messages, set up a webhook endpoint:

```typescript
// Set up webhook handler for text messages
webhookHandler.onMessage(MessageTypesEnum.Text, async (client, message) => {
  console.log('Received text message:', message.text?.body);
  
  // Respond to the message
  await client.messages.text({
    body: `Thanks for your message: "${message.text?.body}"`,
    to: message.from
  });
});

// Handle interactive messages (button responses)
webhookHandler.onMessage(MessageTypesEnum.Interactive, async (client, message) => {
  if (message.interactive?.type === 'button_reply') {
    const buttonId = message.interactive.button_reply?.id;
    
    // Process button response
    if (buttonId === 'help_button') {
      await client.messages.text({
        body: "Here's how I can help you...",
        to: message.from
      });
    }
  }
});
```
