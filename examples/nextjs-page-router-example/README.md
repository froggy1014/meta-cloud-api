# Next.js Page Router WhatsApp Bot Example

Next.js Page Router WhatsApp bot using Meta Cloud API with modular message handlers and builder pattern.

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env.local
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
   - URL: `https://your-ngrok-url.ngrok.io/api/webhook`
   - Token: `your_verification_token`

## Implementation

### Webhook Handler (`/api/webhook.ts`)

The webhook processes incoming messages and routes them to specific handlers:

```typescript
const bot = NextJsWebhook(whatsappConfig);

// Currently only interactive handler is active
bot.processor.onMessage(MessageTypesEnum.Text, handleInteractiveMessage);
```

### Message Handlers (`/lib/messageHandlers/`)

Each message type has its own handler with builder pattern:

**Text Handler** - Echoes messages with typing indicator:
```typescript
const textMessage = new TextMessageBuilder()
    .setBody(`Echo: ${message.text?.body}`)
    .setPreviewUrl(true)
    .build();
```

**Interactive Handler** - Sends menu list:
```typescript
const interactiveMessage = new InteractiveMessageBuilder()
    .setType(InteractiveTypesEnum.List)
    .setTextHeader('Our Menu')
    .setBody('Select items from our menu')
    .setListButtonText('View Menu')
    .addListSections([...])
    .build();
```

**Image Handler** - Responds with sample image:
```typescript
const imageMessage = new ImageMessageBuilder()
    .setLink('https://example.com/image.jpg')
    .setCaption('Sample Image! 📸')
    .build();
```

## Current Configuration

- **Active:** Interactive handler responds to all text messages with menu
- **Available:** Text, image, document, contact, location handlers
- **Raw body parsing** disabled for webhook verification
- **Auto-features:** Read receipts, typing indicators, response delays
