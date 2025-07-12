# Meta Cloud API

<div style="display: flex; align-items: center;">
  <img src="public/README.svg" alt="Meta Cloud API" style="flex: 1; width: 100px;">
  <div style="flex: 1; padding-left: 20px;">
    <p>Meta Cloud API - A powerful TypeScript wrapper for Meta's Cloud API, providing a clean and type-safe interface for WhatsApp Business Platform integration.</p>
  </div>
</div>

[![npm version](https://img.shields.io/npm/v/meta-cloud-api.svg)](https://www.npmjs.com/package/meta-cloud-api)
[![npm downloads](https://img.shields.io/npm/dm/meta-cloud-api.svg)](https://www.npmjs.com/package/meta-cloud-api)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/froggy1014/meta-cloud-api/blob/main/LICENSE)

## Resources

- [Documentation](https://www.meta-cloud-api.xyz/)

## Features

- **Type-Safe Development** - Built with TypeScript to provide code completion and catch errors during development
- **Comprehensive Coverage** - Full support for WhatsApp Business Platform APIs including Messages, Media, Templates, Flows, and more
- **Modular Architecture** - Clean separation of concerns with dedicated API classes for each domain
- **Framework-Specific Webhooks** - Built-in support for Express.js and Next.js webhook handling
- **Advanced Features** - Support for Flows, Encryption, QR Codes, Two-Step Verification, and WABA management
- **Error Handling** - Standardized error handling with detailed Meta API error information

## Installation

```bash
npm install meta-cloud-api
# or
yarn add meta-cloud-api
# or
pnpm add meta-cloud-api
```

## Quick Start

```typescript
import WhatsApp, { MessageTypesEnum } from 'meta-cloud-api';

// Initialize the client
const client = new WhatsApp({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID
});

// Send a WhatsApp text message
const response = await client.messages.text({
  to: '+1234567890',
  body: 'Hello from Meta Cloud API!'
});

console.log(`Message ID: ${response.messages[0].id}`);
```

## Usage Examples

### Messaging

#### Text Message

```typescript
const result = await client.messages.text({
  to: "15551234567",
  body: "Hello from Meta Cloud API!"
});
```

#### Template Message

```typescript
import { ComponentTypesEnum, LanguagesEnum, ParametersTypesEnum } from 'meta-cloud-api';

const result = await client.messages.template({
  to: "15551234567",
  body: {
    name: "shipping_confirmation",
    language: {
      code: LanguagesEnum.English_US,
      policy: "deterministic"
    },
    components: [
      {
        type: ComponentTypesEnum.Body,
        parameters: [
          {
            type: ParametersTypesEnum.Text,
            text: "John Doe"
          },
          {
            type: ParametersTypesEnum.Text,
            text: "12345"
          }
        ]
      }
    ]
  }
});
```

#### Media Message

```typescript
const result = await client.messages.image({
  to: "15551234567",
  body: {
    link: "https://example.com/image.jpg"
  }
});
```

#### Interactive Message

```typescript
import { InteractiveTypesEnum } from 'meta-cloud-api';

const result = await client.messages.interactive({
  to: "15551234567",
  body: {
    type: InteractiveTypesEnum.Button,
    body: {
      text: "What would you like to do?"
    },
    action: {
      buttons: [
        {
          type: "reply",
          reply: {
            id: "help_button",
            title: "Get Help"
          }
        },
        {
          type: "reply",
          reply: {
            id: "info_button",
            title: "Account Info"
          }
        }
      ]
    }
  }
});
```

### Webhook Integration

#### Express.js Webhook

```typescript
import express from 'express';
import { MessageTypesEnum } from 'meta-cloud-api';
import { webhookHandler } from 'meta-cloud-api/webhook/express';

const app = express();

// Create webhook handler
const bot = webhookHandler({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: parseInt(process.env.WA_PHONE_NUMBER_ID!),
  webhookVerificationToken: process.env.WEBHOOK_VERIFICATION_TOKEN!,
});

// Handle text messages
bot.processor.onMessage(MessageTypesEnum.Text, async (whatsapp, message) => {
  await whatsapp.messages.text({
    to: message.from,
    body: `Echo: ${message.text?.body}`,
  });
});

// Setup webhook endpoints
app.get('/webhook', bot.webhook);
app.post('/webhook', express.json(), bot.webhook);

app.listen(3000);
```

#### Next.js Webhook

```typescript
// pages/api/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { MessageTypesEnum } from 'meta-cloud-api';
import { webhookHandler } from 'meta-cloud-api/webhook/nextjs';

const bot = webhookHandler({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN!,
  phoneNumberId: parseInt(process.env.WA_PHONE_NUMBER_ID!),
  webhookVerificationToken: process.env.WEBHOOK_VERIFICATION_TOKEN!,
});

// Handle text messages
bot.processor.onMessage(MessageTypesEnum.Text, async (whatsapp, message) => {
  await whatsapp.messages.text({
    to: message.from,
    body: `Echo: ${message.text?.body}`,
  });
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return bot.webhook(req, res);
}
```

### Advanced Message Handling

```typescript
import { MessageTypesEnum } from 'meta-cloud-api';

// Pre-process all messages (e.g., mark as read)
bot.processor.onMessagePreProcess(async (whatsapp, message) => {
  await whatsapp.messages.markAsRead({ messageId: message.id });
});

// Handle different message types
bot.processor.onMessage(MessageTypesEnum.Text, async (whatsapp, message) => {
  // Handle text messages
});

bot.processor.onMessage(MessageTypesEnum.Image, async (whatsapp, message) => {
  // Handle image messages
});

bot.processor.onMessage(MessageTypesEnum.Document, async (whatsapp, message) => {
  // Handle document messages
});

// Handle message status updates
bot.processor.onMessageStatus(async (whatsapp, status) => {
  console.log(`Message ${status.id} status: ${status.status}`);
});
```

### Templates Management

```typescript
// List all templates
const templates = await client.templates.list({
  businessId: process.env.WA_BUSINESS_ACCOUNT_ID
});

// Create a new template
const newTemplate = await client.templates.create({
  businessId: process.env.WA_BUSINESS_ACCOUNT_ID,
  name: "welcome_message",
  category: "MARKETING",
  components: [
    {
      type: "HEADER",
      format: "TEXT",
      text: "Welcome!"
    },
    {
      type: "BODY",
      text: "Hi {{1}}, welcome to our service!"
    }
  ],
  language: "en_US"
});
```

### Media Management

```typescript
import fs from 'fs';

// Upload media
const mediaUpload = await client.media.upload({
  file: fs.createReadStream("./path/to/image.jpg"),
  type: "image/jpeg"
});

// Get media URL
const media = await client.media.get({
  mediaId: mediaUpload.id
});

// Download media
const mediaBuffer = await client.media.download({
  mediaId: mediaUpload.id
});
```

### Business Profile Management

```typescript
// Update business profile
const profile = await client.businessProfile.update({
  about: "We provide the best service!",
  address: "123 Business St, City",
  description: "Premium products and services",
  email: "contact@business.com",
  websites: ["https://www.business.com"]
});

// Get current profile
const currentProfile = await client.businessProfile.get();
```

### WhatsApp Flows

```typescript
// Create a flow
const flow = await client.flows.create({
  name: "Customer Survey",
  categories: ["SURVEY"],
  clone_flow_id: "existing_flow_id" // Optional
});

// Update flow
const updatedFlow = await client.flows.update({
  flowId: flow.id,
  name: "Updated Survey",
  categories: ["SURVEY", "FEEDBACK"]
});
```

## Example Projects

We provide ready-to-use example projects demonstrating integration with different frameworks:

### [Express.js Echo Bot](./examples/express-example)
A simple echo bot that responds to any text message. Perfect for getting started!

```bash
cd examples/express-example
npm install
cp env.example .env  # Configure your credentials
npm run dev
```

### [Next.js Echo Bot](./examples/nextjs-page-router-example)
Next.js implementation with API routes for webhook handling.

```bash
cd examples/nextjs-page-router-example
npm install
cp env.example .env.local  # Configure your credentials
npm run dev
```

## Modular Imports

Use specific imports for better tree-shaking:

```typescript
// Import specific API classes
import { MessagesApi } from 'meta-cloud-api/messages';
import { MediaApi } from 'meta-cloud-api/media';
import { TemplateApi } from 'meta-cloud-api/template';

// Import specific webhook handlers
import { webhookHandler } from 'meta-cloud-api/webhook/express';
import { webhookHandler } from 'meta-cloud-api/webhook/nextjs';

// Import types and enums
import { MessageTypesEnum, InteractiveTypesEnum } from 'meta-cloud-api/types/enums';
import type { WhatsAppConfig } from 'meta-cloud-api/types/config';
```

## Configuration

```typescript
interface WhatsAppConfig {
  accessToken: string;           // Required: Meta Cloud API access token
  phoneNumberId: number;         // Required: WhatsApp phone number ID
  businessAcctId?: string;       // Optional: Business account ID
  apiVersion?: string;           // Optional: API version (default: v21.0)
  webhookVerificationToken?: string; // Optional: For webhook verification
  requestTimeout?: number;       // Optional: Request timeout in ms
}
```

## Error Handling

```typescript
try {
  const result = await client.messages.text({
    to: "15551234567",
    body: "Hello World"
  });
} catch (error) {
  if (error.response?.data?.error) {
    console.error('Meta API Error:', error.response.data.error);
  } else {
    console.error('Network Error:', error.message);
  }
}
```

## Requirements

- **Node.js** 18 LTS or later
- **TypeScript** 4.5+ (for TypeScript projects)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
