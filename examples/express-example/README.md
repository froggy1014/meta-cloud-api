# Express WhatsApp Bot Example

Express WhatsApp bot using Meta Cloud API with interactive menu.

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env
   ```
   
   Add your credentials:
   ```env
   CLOUD_API_ACCESS_TOKEN=your_access_token
   WA_PHONE_NUMBER_ID=your_phone_number_id
   WEBHOOK_VERIFICATION_TOKEN=your_verification_token
   ```

3. **Run development server:**
   ```bash
   pnpm run dev
   ```

4. **Expose with ngrok:**
   ```bash
   ngrok http 3000
   ```

5. **Configure webhook:**
   - URL: `https://your-ngrok-url.ngrok.io/webhook`
   - Token: `your_verification_token`

## Implementation

Simple Express server that responds to all text messages with an interactive menu:

```typescript
bot.processor.onMessage(MessageTypesEnum.Text, async (whatsapp, message) => {
    await whatsapp.messages.markAsRead({ messageId: message.id });
    await whatsapp.messages.showTypingIndicator({ messageId: message.id });

    const interactiveMessage = new InteractiveMessageBuilder()
        .setType(InteractiveTypesEnum.List)
        .setTextHeader('Our Menu')
        .setBody('Select items from our menu')
        .setListButtonText('View Menu')
        .addListSections([...])
        .build();

    await whatsapp.messages.interactive({
        to: message.from,
        body: interactiveMessage,
    });
});
```

## Features

- Interactive menu list response to any text message
- Read receipts and typing indicators
- Builder pattern for message construction
- Simple Express webhook setup