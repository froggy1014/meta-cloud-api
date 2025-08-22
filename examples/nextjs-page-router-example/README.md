# Next.js Page Router WhatsApp Cloud API Example

Complete Next.js Page Router WhatsApp bot example using the `meta-cloud-api` package with clean architecture, modular message handlers, and builder pattern.

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

## Features

- ✅ **Next.js Page Router** - Traditional API routes pattern
- ✅ **TypeScript** - Full type safety
- ✅ **Clean Architecture** - Simplified webhook setup with `export default Whatsapp.webhook`
- ✅ **Modular Handlers** - Organized message handlers in `/lib/messageHandlers/`
- ✅ **Builder Pattern** - Type-safe message construction
- ✅ **Auto Body Parsing** - Automatic JSON parsing handled by framework
- ✅ **Tree-shakable Imports** - Optimal bundle size with `meta-cloud-api/webhook/nextjs`

## Implementation

### Webhook Handler (`/api/webhook.ts`)

Ultra-clean webhook setup using the new architecture:

```typescript
import { webhookHandler } from 'meta-cloud-api/webhook/nextjs';

const Whatsapp = webhookHandler(whatsappConfig);

// Register message handlers (all available but only interactive active by default)
// Whatsapp.processor.onMessage(MessageTypesEnum.Text, handleTextMessage);
Whatsapp.processor.onMessage(MessageTypesEnum.Text, handleInteractiveMessage);

// Clean export - handles GET verification and POST processing automatically
export default Whatsapp.webhook;
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

## Configuration

### Current Setup
- **Active:** Interactive handler responds to all text messages with menu
- **Available:** Text, image, document, contact, location, reaction, template handlers
- **Auto Body Parsing:** Framework handles JSON parsing automatically
- **Auto Features:** Read receipts, typing indicators, response delays

### Package Imports

Tree-shakable imports for optimal bundle size:

```typescript
// Import only the Next.js Page Router webhook handler
import { webhookHandler } from 'meta-cloud-api/webhook/nextjs';

// Import message types and builders
import { MessageTypesEnum } from 'meta-cloud-api/types/enums';
import { 
    TextMessageBuilder,
    InteractiveMessageBuilder,
    ImageMessageBuilder 
} from 'meta-cloud-api/api/messages/builders';
```

### Alternative Usage Patterns

While the example uses `export default Whatsapp.webhook`, you can also use:

```typescript
// Pattern 1: Clean destructuring (alternative)
const { GET, POST } = Whatsapp;
export { GET, POST };

// Pattern 2: Explicit method exports
export const GET = Whatsapp.GET;
export const POST = Whatsapp.POST;
```

## Architecture Benefits

- **Simplified Setup**: Single webhook export handles both verification and processing
- **Automatic Parsing**: JSON body parsing handled by Next.js framework
- **Type Safety**: Full TypeScript support throughout
- **Code Splitting**: Import only what you need
- **Next.js Native**: Proper Next.js API route patterns
