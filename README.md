# Meta Cloud API Toolkit

This monorepo contains tools and documentation for working with the Meta Cloud API.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

The Meta Cloud API Toolkit provides:

- **`meta-cloud-api`**: A TypeScript library providing a clean interface for Meta Cloud APIs
- **Documentation**: Comprehensive guides and API references built with Docusaurus
- **Playground**: Interactive examples demonstrating API integration with Next.js

## Installation

```bash
npm install meta-cloud-api
# or
yarn add meta-cloud-api
# or
pnpm add meta-cloud-api
```

## Usage

```typescript
import { MetaCloudAPI } from 'meta-cloud-api';

// Initialize the client with your credentials
const client = new MetaCloudAPI({
  apiKey: process.env.META_API_KEY,
  // Additional configuration options
});
```

### WhatsApp Messages

Send a text message:

```typescript
// Send a simple text message
const result = await client.whatsapp.messages.send({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to: "15551234567",
  type: "text",
  text: {
    body: "Hello from Meta Cloud API!"
  }
});
console.log(`Message ID: ${result.messages[0].id}`);
```

Send a template message:

```typescript
// Send a template message with parameters
const result = await client.whatsapp.messages.send({
  messaging_product: "whatsapp",
  to: "15551234567",
  type: "template",
  template: {
    name: "sample_shipping_confirmation",
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

Send a media message:

```typescript
// Send an image message
const result = await client.whatsapp.messages.send({
  messaging_product: "whatsapp",
  to: "15551234567",
  type: "image",
  image: {
    link: "https://example.com/image.jpg"
  }
});
```

### Message Templates

List all templates:

```typescript
// Get all message templates
const templates = await client.whatsapp.templates.list({
  business_id: "1234567890"
});
console.log(`Found ${templates.total_count} templates`);
```

Create a new template:

```typescript
// Create a new template
const newTemplate = await client.whatsapp.templates.create({
  business_id: "1234567890",
  name: "my_special_template",
  category: "MARKETING",M
  components: [
    {
      type: "HEADER",
      format: "TEXT",
      text: "Special Offer Inside"
    },
    {
      type: "BODY",
      text: "Hi {{1}}, we have a special offer for you: {{2}}% off your next purchase!"
    },
    {
      type: "FOOTER",
      text: "Tap the button below to shop now"
    },
    {
      type: "BUTTONS",
      buttons: [
        {
          type: "URL",
          text: "Shop Now",
          url: "https://example.com/shop?ref={{1}}"
        }
      ]
    }
  ],
  language: "en_US"
});
```

### Phone Numbers

List phone numbers:

```typescript
// List all WhatsApp business phone numbers
const phoneNumbers = await client.whatsapp.phoneNumbers.list({
  business_id: "1234567890"
});

for (const number of phoneNumbers.data) {
  console.log(`Phone: ${number.display_phone_number}, Status: ${number.quality_rating}`);
}
```

Register a phone number:

```typescript
// Register a phone number with the WhatsApp Business API
const registration = await client.whatsapp.registration.register({
  messaging_product: "whatsapp",
  pin: "12345"
});

console.log(`Registration status: ${registration.status}`);
```

### Media Management

Upload media:

```typescript
// Upload a file to be used in messages
const mediaUpload = await client.whatsapp.media.upload({
  messaging_product: "whatsapp",
  file: fs.createReadStream("./path/to/image.jpg"),
  type: "image/jpeg"
});

console.log(`Media ID: ${mediaUpload.id}`);
```

Retrieve media URL:

```typescript
// Get the URL for a previously uploaded media
const media = await client.whatsapp.media.get({
  media_id: "123456789"
});

console.log(`Media URL: ${media.url}`);
// Download or process the media using the URL
```

### Business Profile

Update business profile:

```typescript
// Update WhatsApp Business Profile information
const profile = await client.whatsapp.businessProfile.update({
  messaging_product: "whatsapp",
  phone_number_id: "1234567890",
  about: "We provide the best service!",
  address: "123 Business St, City",
  description: "Premium products and services",
  email: "contact@business.com",
  websites: ["https://www.business.com"],
  vertical: "RETAIL"
});
```

### Two-Step Verification

Set up verification:

```typescript
// Set up two-step verification for a phone number
const result = await client.whatsapp.twoStepVerification.set({
  pin: "123456"
});

console.log("Two-step verification configured successfully");
```

### QR Code API

Generate a QR code:

```typescript
// Generate a QR code for linking a device
const qrCode = await client.whatsapp.qrCode.generate({
  prefilled_message: "Hello! I'm contacting you from your website."
});

console.log(`QR Code URL: ${qrCode.code}`);
```

### Flows API

Start a flow:

```typescript
// Start a flow with a user
const flowResponse = await client.whatsapp.flows.start({
  to: "15551234567",
  mode: "IVR",
  flow_id: "291075350123526",
  flow_token: "abcdefghijklmnop",
  flow_message_version: "3",
  data: {
    screen_one: {
      first_name: "John",
      last_name: "Doe"
    }
  }
});

console.log(`Flow started with message ID: ${flowResponse.messages[0].id}`);
```

### Meta API Error Structure

Meta API errors follow a specific format:

```typescript
interface MetaError {
  error: {
    message: string;
    type: string;
    code: number;
    error_data?: {
      messaging_product: 'whatsapp';
      details: string;
    };
    error_subcode?: number;
    fbtrace_id: string;
  };
}
```

### Common Meta API Error Codes

| Category | Code | Description | Common Solution |
|----------|------|-------------|----------------|
| **Authorization** | 0 | Authentication failed | Refresh your access token |
| **Authorization** | 10 | Permission denied | Verify API permissions |
| **Authorization** | 190 | Access token expired | Get a new access token |
| **Rate Limits** | 4 | Too many API calls | Reduce API call frequency |
| **Rate Limits** | 130429 | Rate limit hit | Implement exponential backoff |
| **Rate Limits** | 131048 | Spam rate limit | Check quality rating in WhatsApp Manager |
| **Integrity** | 368 | Temporarily blocked | Review platform policy violations |
| **Messaging** | 130015 | Message failed to send | Verify recipient phone format |
| **Messaging** | 131051 | Template not approved | Review template status in WhatsApp Manager |

For a complete list of error codes, refer to the [Meta WhatsApp Cloud API error documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes/).



## Requirements

- TypeScript >= 4.5
- Node.js 18 LTS or later
- Modern browsers (Chrome, Firefox, Safari, Edge)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.