---
sidebar_position: 11
---

# Reaction Messages

Reaction messages allow you to send emoji reactions to specific messages in a WhatsApp conversation. This is similar to how users can react to messages in the WhatsApp application.

## Basic Usage

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize client
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN'
});

// Send a reaction to a message
const response = await whatsapp.messages.reaction(
  "😊", // emoji
  "wamid.abcd1234...", // message ID to react to
  15551234567 // recipient
);

console.log(`Reaction message sent with ID: ${response.data.messages[0].id}`);
```

## Parameters

The `reaction()` method accepts the following parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| emoji | string | The emoji to use as a reaction |
| messageId | string | The ID of the message to react to |
| recipient | string or number | The recipient's phone number with country code |

## Examples

### Reacting to a Message with an Emoji

```typescript
const response = await whatsapp.messages.reaction(
  "👍",
  "wamid.HBgLMTY1MDUwNzY1MjAVAgARGBI5QTNDQTVCM0Q0Q0Q2RTY3RTcA",
  15551234567
);
```

### Removing a Reaction

To remove a reaction, send an empty string as the emoji:

```typescript
const response = await whatsapp.messages.reaction(
  "",
  "wamid.HBgLMTY1MDUwNzY1MjAVAgARGBI5QTNDQTVCM0Q0Q0Q2RTY3RTcA",
  15551234567
);
```

## Common Emoji Reactions

Here are some commonly used emoji reactions:

| Emoji | Unicode | Description |
|-------|---------|-------------|
| 👍 | U+1F44D | Thumbs up |
| ❤️ | U+2764 FE0F | Red heart |
| 😂 | U+1F602 | Face with tears of joy |
| 😮 | U+1F62E | Face with open mouth |
| 😢 | U+1F622 | Crying face |
| 🙏 | U+1F64F | Folded hands |
| 🔥 | U+1F525 | Fire |
| 👏 | U+1F44F | Clapping hands |

## Error Handling

```typescript
try {
  const response = await whatsapp.messages.reaction(
    "👍",
    "wamid.HBgLMTY1MDUwNzY1MjAVAgARGBI5QTNDQTVCM0Q0Q0Q2RTY3RTcA",
    15551234567
  );
  console.log("Reaction message sent successfully:", response.data);
} catch (error) {
  console.error("Error sending reaction message:", error);
  
  // Handle specific error cases
  if (error.response && error.response.data) {
    if (error.response.data.error.code === 131051) {
      console.log("Message to react to not found");
    } else {
      console.log("Error details:", error.response.data);
    }
  }
}
```

## Limitations

- You can only react to messages that are still available in the chat history
- You can only use one emoji per reaction
- The message ID must be valid and accessible
- Not all emoji are supported as reactions

## Best Practices

1. **Use common emojis**: Stick to commonly used reaction emojis for better compatibility.

2. **React promptly**: Reactions are most meaningful when sent promptly after receiving a message.

3. **Use reactions appropriately**: Choose reactions that make sense in the context of the conversation.

4. **Don't overuse reactions**: Use reactions sparingly and when they add value to the conversation.

5. **Consider cultural context**: Be aware that emoji meanings can vary across different cultures.

## Related

- [Text Messages](./text.md) - For sending text-based information
- [Replying to Messages](../messaging-guide.md#replying-to-messages) - For sending replies to messages
- [Marking Messages as Read](../messaging-guide.md#marking-messages-as-read) - For marking messages as read 