# Meta Cloud API

<div style="display: flex; align-items: center;">
  <img src="../../public/README.svg" alt="Meta Cloud API" style="flex: 1; width: 100px;">
  <div style="flex: 1; padding-left: 20px;">
    <p>Meta Cloud API - A powerful TypeScript wrapper for Meta's Cloud API, providing a clean and type-safe interface for WhatsApp Business Platform integration.</p>
  </div>
</div>

## Resources

- [Documentation](https://www.meta-cloud-api.xyz/)
- [API Reference (Swagger)](https://meta-cloud-api-swagger.vercel.app/api-docs/)

## Features

- **Type-Safe Development** - Built with TypeScript to provide code completion and catch errors during development
- **Comprehensive Coverage** - Full support for WhatsApp Business Platform APIs
- **Clean Interface** - Intuitive methods organized by domain for improved code readability
- **Error Handling** - Standardized error handling with detailed Meta API error information
- **Webhook Handler** - Built-in support for webhook verification and message handling

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

Send different types of messages through WhatsApp Business Platform:

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

## Example Projects

We provide ready-to-use example projects demonstrating how to integrate Meta Cloud API in different frameworks:

- [Express.js Example](./examples/express-example) - A simple Express.js server with webhook handling for WhatsApp messages
- [Next.js Example](./examples/nextjs-page-router-example) - Integration with Next.js Pages Router, showing how to handle webhooks in a Next.js API route

Each example includes its own README with setup instructions and demonstration of core features.

### Webhook Integration

Set up a webhook to receive messages and events from the WhatsApp API:

```typescript
import WhatsApp, { 
  WebhookHandler, 
  MessageTypesEnum, 
  WebhookMessage 
} from 'meta-cloud-api';

// Initialize the handler
const webhookHandler = new WebhookHandler({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN,
  phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID),
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID,
  webhookVerificationToken: process.env.WEBHOOK_VERIFICATION_TOKEN
});

// Handle webhook verification
app.get('/webhook', (req, res) => {
  webhookHandler.handleVerificationRequest(req, res);
});

// Handle incoming messages
app.post('/webhook', (req, res) => {
  webhookHandler.handleWebhookRequest(req, res);
});

// Pre-process all messages (e.g., mark as read)
webhookHandler.onMessagePreProcess(async (client: WhatsApp, message: WebhookMessage) => {
  await client.messages.markAsRead({ messageId: message.id });
});

// Handle text messages
webhookHandler.onMessage(MessageTypesEnum.Text, async (client: WhatsApp, message: WebhookMessage) => {
  if (message.text?.body) {
    await client.messages.text({
      body: `You said: "${message.text.body}"`,
      to: message.from
    });
  }
});

// Handle image messages
webhookHandler.onMessage(MessageTypesEnum.Image, async (client: WhatsApp, message: WebhookMessage) => {
  await client.messages.text({
    body: "Thanks for the image!",
    to: message.from
  });
});
```

### Templates

Manage message templates for your WhatsApp Business account:

```typescript
// List all templates
const templates = await client.templates.list({
  businessId: process.env.WA_BUSINESS_ACCOUNT_ID
});

// Create a new template
const newTemplate = await client.templates.create({
  businessId: process.env.WA_BUSINESS_ACCOUNT_ID,
  name: "my_special_template",
  category: "MARKETING",
  components: [
    {
      type: "HEADER",
      format: "TEXT",
      text: "Special Offer"
    },
    {
      type: "BODY",
      text: "Hi {{1}}, we have a special offer for you: {{2}}% off your next purchase!"
    },
    {
      type: "FOOTER",
      text: "Tap the button below to shop now"
    }
  ],
  language: "en_US"
});
```

### Media Management

Upload and retrieve media for your messages:

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
```

### Business Profile

Update your WhatsApp Business profile information:

```typescript
const profile = await client.businessProfile.update({
  about: "We provide the best service!",
  address: "123 Business St, City",
  description: "Premium products and services",
  email: "contact@business.com",
  websites: ["https://www.business.com"]
});
```

## Requirements

- TypeScript 4.5+
- Node.js 18 LTS or later

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
