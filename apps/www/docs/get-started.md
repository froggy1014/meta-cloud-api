---
sidebar_position: 2
---

# Getting Started

This guide will help you quickly set up and start using the Meta Cloud API wrapper for WhatsApp.

## Installation

Install the Meta Cloud API package using npm or yarn:

```bash
# Using npm
npm install meta-cloud-api

# Using yarn
yarn add meta-cloud-api

# Using pnpm
pnpm add meta-cloud-api
```

## Basic Setup

There are two ways to configure the Meta Cloud API wrapper:

### Option 1: Direct Configuration

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize with configuration object
const whatsapp = new WhatsApp({
  phoneNumberId: 'YOUR_PHONE_NUMBER_ID',
  accessToken: 'YOUR_ACCESS_TOKEN',
  // Optional parameters
  businessAcctId: 'YOUR_BUSINESS_ACCOUNT_ID', // Optional
  apiVersion: '22' // Optional, defaults to latest version
});
```

### Option 2: Environment Variables

Create a `.env` file in your project root:

```
META_PHONE_NUMBER_ID=YOUR_PHONE_NUMBER_ID
META_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
META_BUSINESS_ACCT_ID=YOUR_BUSINESS_ACCOUNT_ID
META_API_VERSION=22
```

Then initialize without parameters:

```typescript
import WhatsApp from 'meta-cloud-api';

// The wrapper will automatically use environment variables
const whatsapp = new WhatsApp();
```

## Sending Your First Message

### Text Message

```typescript
// Send a simple text message
const response = await whatsapp.messages.text(
  { body: "Hello from Meta Cloud API!" },
  "15551234567" // Recipient's phone number
);

// The response is already JSON - no need to call .json()
console.log(`Message sent with ID: ${response.messages[0].id}`);
```

### Template Message

```typescript
// Send a template message
const response = await whatsapp.messages.template(
  {
    name: "sample_shipping_confirmation", // Your approved template name
    language: {
      code: "en_US"
    },
    components: [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: "John"
          },
          {
            type: "text",
            text: "XYZ12345"
          }
        ]
      }
    ]
  },
  "15551234567" // Recipient's phone number
);

// Access the response data directly
console.log(`Template message sent with ID: ${response.messages[0].id}`);
```

### Media Message

```typescript
// Send an image message
const response = await whatsapp.messages.image(
  {
    link: "https://example.com/image.jpg",
    caption: "Check out this image!"
  },
  "15551234567" // Recipient's phone number
);

// Access the response data directly
console.log(`Image message sent with ID: ${response.messages[0].id}`);
```

## Error Handling

The wrapper provides clear error handling:

```typescript
try {
  const response = await whatsapp.messages.text(
    { body: "Hello from Meta Cloud API!" },
    "15551234567"
  );
  console.log(`Message sent with ID: ${response.messages[0].id}`);
} catch (error) {
  console.error("Error sending message:", error);
  
  // Meta API errors include detailed information
  if (error.name === 'MetaError') {
    console.error(`Error code: ${error.error.code}`);
    console.error(`Error message: ${error.error.message}`);
    console.error(`Error type: ${error.error.type}`);
  }
}
```

## Next Steps

Now that you've sent your first message, you can:

- Learn about [configuration settings](./settings.md) for more advanced options
- Explore the [API Reference](./template-api.md) for all available methods
- Check out our [Tutorials](./tutorials/sending-messages.md) for common use cases

For more information about the WhatsApp Cloud API itself, refer to the [official Meta documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/).
