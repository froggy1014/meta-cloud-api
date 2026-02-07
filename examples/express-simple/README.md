# Express WhatsApp Cloud API Example

Complete Express.js WhatsApp bot example using the `meta-cloud-api` package with clean architecture pattern and comprehensive message handling.

## 🚀 Setup

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

## 🏗️ Clean Architecture Implementation

The Express example now uses the new clean architecture pattern:

### Pattern 1: Clean Destructuring (Recommended)
```typescript
import { webhookHandler } from 'meta-cloud-api/webhook/express';

const Whatsapp = webhookHandler(config);
const { GET, POST } = Whatsapp;

app.get('/webhook', GET);
app.post('/webhook', express.json(), POST);
```

### Pattern 2: Direct Method Access
```typescript
app.get('/webhook', Whatsapp.GET);
app.post('/webhook', express.json(), Whatsapp.POST);
```

### Pattern 3: Auto-routing (Simplest)
```typescript
app.use('/webhook', express.json());
app.all('/webhook', Whatsapp.webhook);
```

## 📱 Message Handlers

The example includes comprehensive message handlers:

```typescript
// Register all message types
Whatsapp.processor.onMessage(MessageTypesEnum.Text, handleTextMessage);
Whatsapp.processor.onMessage(MessageTypesEnum.Image, handleImageMessage);
Whatsapp.processor.onMessage(MessageTypesEnum.Document, handleDocumentMessage);
Whatsapp.processor.onMessage(MessageTypesEnum.Contacts, handleContactMessage);
Whatsapp.processor.onMessage(MessageTypesEnum.Location, handleLocationMessage);
Whatsapp.processor.onMessage(MessageTypesEnum.Interactive, handleInteractiveMessage);
```

## ✨ Features

- 🔄 Clean architecture with GET/POST destructuring
- 📝 Multiple message type handlers (text, image, document, contact, location, interactive)
- ✅ Read receipts and typing indicators
- 🏗️ Builder pattern for message construction
- 🚀 Simple Express webhook setup
- 🔧 Environment-based configuration
- 📊 Comprehensive logging
- 🔀 WhatsApp Flow support
- 🎯 Tree-shakable imports from `meta-cloud-api/webhook/express`

## 🛠️ Architecture Benefits

- **Clean API**: `const { GET, POST } = Whatsapp`
- **Type Safety**: Full TypeScript support
- **Flexibility**: Multiple usage patterns
- **Maintainability**: Organized message handlers
- **Express-native**: Proper Express error handling with `next()`
- **Code Splitting**: Import only what you need for optimal bundle size

## 📦 Package Imports

The example uses tree-shakable imports for optimal bundle size:

```typescript
// Import only the Express webhook handler
import { webhookHandler } from 'meta-cloud-api/webhook/express';

// Import specific message types (optional for type safety)
import { MessageTypesEnum } from 'meta-cloud-api/types/enums';

// Import builders for message construction
import { 
    TextMessageBuilder,
    ImageMessageBuilder,
    InteractiveMessageBuilder 
} from 'meta-cloud-api/api/messages/builders';
```

## 🔧 Deployment

### Production Checklist

- [ ] Set up HTTPS (required by Meta)
- [ ] Configure environment variables
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure webhook URL in Meta Developer Console
- [ ] Test webhook verification
- [ ] Test message processing

### Platform Examples

**Render/Railway:**
```bash
# Environment variables
CLOUD_API_ACCESS_TOKEN=your_token
WA_PHONE_NUMBER_ID=your_id
WEBHOOK_VERIFICATION_TOKEN=your_verification_token
```

**Local Testing with ngrok:**
```bash
ngrok http 3000
# Use the HTTPS URL for webhook configuration
```