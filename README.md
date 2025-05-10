# Meta Cloud API

<div style="display: flex; align-items: center;">
  <img src="public/README.svg" alt="Meta Cloud API" style="flex: 1; width: 100px;">
  <div style="flex: 1; padding-left: 20px;">
    <p>Meta Cloud API - A powerful TypeScript wrapper for Meta's Cloud API, providing a clean and type-safe interface for WhatsApp Business Platform integration.</p>
    <p>
      <a href="LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="GitHub license">
      </a>
    </p>
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
import { WhatsApp } from 'meta-cloud-api';

// Initialize the client
const client = new WhatsApp({
  accessToken: process.env.ACCESS_TOKEN,
  phoneNumberId: process.env.PHONE_NUMBER_ID,
  version: '22'  // API version
});

// Send a WhatsApp message
const response = await client.messages.send({
  to: '+1234567890',
  type: 'text',
  text: {
    body: 'Hello from Meta Cloud API!'
  }
});

console.log(`Message ID: ${response.messages[0].id}`);
```

## Usage Examples

### Messaging

Send different types of messages through WhatsApp Business Platform:

#### Text Message

```typescript
const result = await client.messages.send({
  to: "15551234567",
  type: "text",
  text: {
    body: "Hello from Meta Cloud API!"
  }
});
```

#### Template Message

```typescript
const result = await client.messages.send({
  to: "15551234567",
  type: "template",
  template: {
    name: "shipping_confirmation",
    language: {
      code: "en_US"
    },
    components: [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: "John Doe"
          },
          {
            type: "text",
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
const result = await client.messages.send({
  to: "15551234567",
  type: "image",
  image: {
    link: "https://example.com/image.jpg"
  }
});
```

### Templates

Manage message templates for your WhatsApp Business account:

```typescript
// List all templates
const templates = await client.templates.list({
  business_id: "1234567890"
});

// Create a new template
const newTemplate = await client.templates.create({
  business_id: "1234567890",
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
// Upload media
const mediaUpload = await client.media.upload({
  file: fs.createReadStream("./path/to/image.jpg"),
  type: "image/jpeg"
});

// Get media URL
const media = await client.media.get({
  media_id: mediaUpload.id
});
```

### Business Profile

Update your WhatsApp Business profile information:

```typescript
const profile = await client.businessProfile.update({
  phone_number_id: "1234567890",
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
