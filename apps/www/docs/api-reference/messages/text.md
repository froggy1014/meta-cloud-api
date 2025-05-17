---
sidebar_position: 2
---

# Text Messages

Text messages are the simplest form of WhatsApp messages. They allow you to send plain text content to your recipients.

## Basic Usage

To send a text message, use the `messages.text()` method:

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize client
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN'
});

// Send text message
const response = await whatsapp.messages.text({
  body: "Hello from Meta Cloud API!",
  to: "15551234567" // Phone number with country code
});

console.log(`Message sent with ID: ${response.messages[0].id}`);
```

## Parameters

The `text()` method accepts a parameter object with the following properties:

| Parameter | Type | Description |
|-----------|------|-------------|
| body | string or TextObject | The text message content or object |
| to | string | The recipient's phone number with country code |
| previewUrl | boolean (optional) | Whether to show URL previews in the message |
| replyMessageId | string (optional) | ID of a message to reply to |

### TextObject Properties

When using an object for the body parameter:

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| body | string | The text content of the message | Yes |
| preview_url | boolean | Whether to show URL previews in the message | No |

## Examples

### Simple Text Message

```typescript
const response = await whatsapp.messages.text({
  body: "Hello! How can I help you today?",
  to: "15551234567"
});
```

### Text Message with URL Preview

When you include a URL in your message, you can enable URL previews:

```typescript
const response = await whatsapp.messages.text({
  body: {
    body: "Check out our website: https://example.com",
    preview_url: true
  },
  to: "15551234567"
});

// Alternative syntax using previewUrl parameter
const response = await whatsapp.messages.text({
  body: "Check out our website: https://example.com",
  to: "15551234567",
  previewUrl: true
});
```

### Formatting Text Messages

You can use basic formatting in your text messages:

```typescript
const response = await whatsapp.messages.text({
  body: "This text can be *bold*, _italic_, ~strikethrough~, or ```monospace```.",
  to: "15551234567"
});
```

### Long Text Messages

WhatsApp supports messages up to 4096 characters:

```typescript
const response = await whatsapp.messages.text({
  body: "This is a longer message that can contain detailed information. WhatsApp text messages can be up to 4096 characters long, giving you plenty of space to provide detailed information to your customers...",
  to: "15551234567"
});
```

### Replying to a Message

```typescript
const originalMessageId = "wamid.abcd1234...";

const response = await whatsapp.messages.text({
  body: "This is a reply to your question",
  to: "15551234567",
  replyMessageId: originalMessageId
});
```

## Error Handling

```typescript
try {
  const response = await whatsapp.messages.text({
    body: "Hello from Meta Cloud API!",
    to: "15551234567"
  });
  console.log("Message sent successfully:", response);
} catch (error) {
  console.error("Error sending text message:", error);
  
  // Handle specific error cases
  if (error.response && error.response.data) {
    console.log("Error details:", error.response.data);
  }
}
```

## Best Practices

1. **Keep messages concise**: While WhatsApp supports long messages, shorter messages typically have better engagement.

2. **Use formatting sparingly**: Use formatting to highlight important information, but don't overuse it.

3. **Consider time zones**: Be mindful of when you're sending messages to avoid disturbing recipients during off-hours.

4. **Personalize messages**: When possible, personalize messages with the recipient's name or relevant information.

5. **Include clear calls to action**: If you want the recipient to take action, make it clear what they should do next.
