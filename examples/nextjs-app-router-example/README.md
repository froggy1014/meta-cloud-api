# Next.js 15 App Router WhatsApp Cloud API Example

This example demonstrates how to use the `meta-cloud-api` package with Next.js 15's App Router to handle WhatsApp Cloud API webhooks and flows. All logic from the Page Router example has been migrated to showcase the full functionality.

## Features

- ✅ **Next.js 15 App Router** - Using the latest Next.js features with native Web APIs
- ✅ **TypeScript** - Full type safety throughout
- ✅ **Complete Message Handlers** - All message types supported
- ✅ **Message Builders** - Using builder pattern for all message types
- ✅ **Flow Handler** - Manages WhatsApp Flow interactions with dedicated route
- ✅ **Clean Architecture** - Organized message handlers with path aliases
- ✅ **Event Logging** - Comprehensive logging for debugging
- ✅ **Tree-shakable Imports** - Optimal bundle size with `meta-cloud-api/webhook/nextjs-app`
- ✅ **Web Standard APIs** - Uses native `Request` and `Response` objects
- ✅ **Performance Optimized** - Leverages Next.js 15 runtime optimizations

## Message Handlers

The example includes comprehensive message handlers for all WhatsApp message types:

### 📨 Text Messages (`src/lib/messageHandlers/text.ts`)
- Echoes back received text messages
- Uses `TextMessageBuilder` with URL preview support
- Includes typing indicators and read receipts

### 📷 Image Messages (`src/lib/messageHandlers/image.ts`)
- Responds with sample images using `ImageMessageBuilder`
- Supports captions and external image URLs

### 📄 Document Messages (`src/lib/messageHandlers/document.ts`)
- Sends PDF documents using `DocumentMessageBuilder`
- Includes filename and caption support

### 👤 Contact Messages (`src/lib/messageHandlers/contact.ts`)
- Responds with contact cards using `ContactMessageBuilder`
- Includes phone, email, organization, and URL details

### 📍 Location Messages (`src/lib/messageHandlers/location.ts`)
- Sends location data using `LocationMessageBuilder`
- Supports coordinates, names, and addresses

### 🔘 Interactive Messages (`src/lib/messageHandlers/interactive.ts`)
- Creates list and button menus using `InteractiveMessageBuilder`
- Handles user interactions and selections

### 👍 Reactions (`src/lib/messageHandlers/reaction.ts`)
- Utility to send emoji reactions to messages
- Supports any emoji reaction

### 📋 Templates (`src/lib/messageHandlers/template.ts`)
- Sends approved template messages using `TemplateMessageBuilder`
- Supports parameterized templates

## API Routes Structure

### Webhook Route (`app/api/webhook/route.ts`)

Complete webhook handler with all message types registered:

```typescript
import { webhookHandler } from 'meta-cloud-api/webhook/nextjs-app';
import { 
    handleTextMessage,
    handleImageMessage,
    handleDocumentMessage,
    // ... other handlers
} from '@/lib/messageHandlers';

const Whatsapp = webhookHandler(config);

// Register all message handlers
Whatsapp.processor.onMessage(MessageTypesEnum.Text, handleTextMessage);
Whatsapp.processor.onMessage(MessageTypesEnum.Image, handleImageMessage);
// ... register other handlers

// Clean export pattern
export const { GET, POST } = Whatsapp.webhook;
```

### Flow Route (`app/api/flow/route.ts`)

Manages WhatsApp Flow interactions with proper event handling:

```typescript
import { webhookHandler } from 'meta-cloud-api/webhook/nextjs-app';

const WhatsappFlow = webhookHandler(config);

// Register flow handlers
WhatsappFlow.processor.onFlow(FlowTypeEnum.DataExchange, handler);
WhatsappFlow.processor.onFlow(FlowTypeEnum.Init, handler);

export const { GET, POST } = WhatsappFlow.flow;
```

## Package Imports

The example uses tree-shakable imports for optimal bundle size:

```typescript
// Import only the Next.js App Router webhook handler
import { webhookHandler } from 'meta-cloud-api/webhook/nextjs-app';

// Import specific message types and enums
import { MessageTypesEnum, FlowTypeEnum } from 'meta-cloud-api/types/enums';

// Import builders for message construction
import { 
    TextMessageBuilder,
    ImageMessageBuilder,
    InteractiveMessageBuilder,
    ContactMessageBuilder,
    LocationMessageBuilder,
    DocumentMessageBuilder
} from 'meta-cloud-api/api/messages/builders';
```

## Project Structure

```
src/
├── lib/
│   └── messageHandlers/
│       ├── index.ts          # Barrel exports
│       ├── text.ts           # Text message handler
│       ├── image.ts          # Image message handler
│       ├── document.ts       # Document message handler
│       ├── contact.ts        # Contact message handler
│       ├── location.ts       # Location message handler
│       ├── interactive.ts    # Interactive message handler
│       ├── reaction.ts       # Reaction utilities
│       └── template.ts       # Template message utilities
app/
├── api/
│   ├── webhook/
│   │   └── route.ts          # Main webhook handler
│   └── flow/
│       └── route.ts          # Flow handler
```

## Key Differences from Page Router

1. **Native Web APIs**: Uses standard `Request` and `Response` objects
2. **Cleaner Exports**: Direct export of HTTP method handlers
3. **Better Performance**: Leverages Next.js 15 optimizations
4. **Path Aliases**: Uses `@/*` for clean imports
5. **Modular Architecture**: Organized handlers in separate files

## Environment Variables

```env
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_WEBHOOK_VERIFICATION_TOKEN=your_webhook_verification_token_here
```

## Getting Started

1. **Install dependencies**: `pnpm install`
2. **Set up environment**: Copy `.env.example` to `.env.local`
3. **Fill in WhatsApp credentials** in `.env.local`
4. **Start development**: `pnpm dev`

Your webhook will be available at `http://localhost:3000/api/webhook`

## Customization

### Enable/Disable Handlers

Comment out handlers you don't need in `app/api/webhook/route.ts`:

```typescript
// Text message handler (enabled by default)
Whatsapp.processor.onMessage(MessageTypesEnum.Text, handleTextMessage);

// Image message handler - uncomment to enable
// Whatsapp.processor.onMessage(MessageTypesEnum.Image, handleImageMessage);
```

### Modify Message Responses

Each handler in `src/lib/messageHandlers/` can be customized:

```typescript
// Customize text responses in text.ts
const textMessage = new TextMessageBuilder()
    .setBody(`Custom response: ${message.text?.body}`)
    .setPreviewUrl(true)
    .build();
```

## Builder Pattern Examples

All message types use the builder pattern for clean, type-safe message construction:

```typescript
// Text with preview
const text = new TextMessageBuilder()
    .setBody('Check this link: https://example.com')
    .setPreviewUrl(true)
    .build();

// Image with caption
const image = new ImageMessageBuilder()
    .setLink('https://example.com/image.jpg')
    .setCaption('Beautiful image!')
    .build();

// Interactive list
const interactive = new InteractiveMessageBuilder()
    .setType(InteractiveTypesEnum.List)
    .setTextHeader('Menu')
    .setBody('Choose an option')
    .setListButtonText('View Options')
    .addListSections([...])
    .build();
```

## Deployment

### Vercel (Recommended for Next.js)

1. **Connect your repository** to Vercel
2. **Add environment variables** in your Vercel dashboard:
   ```
   WHATSAPP_ACCESS_TOKEN=your_access_token
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id  
   WHATSAPP_WEBHOOK_VERIFICATION_TOKEN=your_verification_token
   ```
3. **Deploy** and use your Vercel domain for webhook configuration

### Other Platforms

**Netlify:**
- Configure environment variables in site settings
- Deploy using Git integration

**Railway/Render:**
- Set environment variables in dashboard
- Configure HTTPS domain for webhook

### Local Development

```bash
# Start development server
pnpm dev

# Expose locally with ngrok
ngrok http 3000

# Use the HTTPS ngrok URL for Meta webhook configuration
```

## Architecture Advantages

### vs Page Router
- **Web Standards**: Native `Request`/`Response` objects
- **Better Performance**: Optimized runtime with App Router
- **Cleaner Code**: No custom req/res interfaces needed
- **Future-proof**: Built on web standards

### vs Express
- **Zero Config**: No server setup required
- **Serverless Ready**: Works with any serverless platform
- **Next.js Integration**: Seamless integration with Next.js features
- **TypeScript**: Built-in TypeScript support

## Troubleshooting

### Common Issues

1. **Webhook verification failing**
   - Ensure environment variables are set in `.env.local`
   - Check that your webhook URL uses HTTPS
   - Verify the verification token matches Meta app settings

2. **Messages not processing**
   - Check browser network tab for POST request errors
   - Verify all required environment variables are set
   - Check console logs for handler errors

3. **Build errors**
   - Ensure all dependencies are installed: `pnpm install`
   - Check that TypeScript types are correct
   - Verify import paths are correct with path aliases