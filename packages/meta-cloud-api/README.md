# Meta Cloud API

A TypeScript SDK for the Meta Cloud API that provides a clean, strongly-typed interface for interacting with WhatsApp's Cloud API and other Meta platform services.

[![npm version](https://img.shields.io/npm/v/meta-cloud-api.svg)](https://www.npmjs.com/package/meta-cloud-api)
[![npm downloads](https://img.shields.io/npm/dm/meta-cloud-api.svg)](https://www.npmjs.com/package/meta-cloud-api)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/froggy1014/meta-cloud-api/blob/main/LICENSE)

## Features

- **Strongly Typed**: Full TypeScript support with comprehensive type definitions
- **Modular Design**: API components are organized logically for ease of use
- **Error Handling**: Standardized error handling for Meta API responses
- **Complete API Coverage**: Support for all WhatsApp Cloud API functionality
  - Messages API (text, templates, media, interactive, etc.)
  - Templates API
  - Media API
  - Phone Number API
  - Flow API
  - QR Code API
  - Registration API
  - WABA (WhatsApp Business Account) API
  - Two-Step Verification API
  - Encryption API

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
import WhatsApp from 'meta-cloud-api';

// Initialize with configuration object
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN'
});

// You can also use environment variables (.env file)
// const whatsapp = new WhatsApp();

// Send a text message
async function sendMessage() {
  try {
    const response = await whatsapp.messages.text(
      { body: "Hello from Meta Cloud API!" },
      15551234567
    );
    console.log(`Message sent successfully with ID: ${response.messages[0].id}`);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
```

## Environment Variables

Create a `.env` file with your WhatsApp Cloud API credentials:

```
WA_BASE_URL=graph.facebook.com
M4D_APP_ID=your_app_id
M4D_APP_SECRET=your_app_secret
WA_PHONE_NUMBER_ID=your_phone_number_id
WA_BUSINESS_ACCOUNT_ID=your_business_account_id
CLOUD_API_ACCESS_TOKEN=your_access_token
CLOUD_API_VERSION=17.0
```

## API Documentation

### Messages API

Send various types of WhatsApp messages:

```typescript
// Text message
await whatsapp.messages.text(
  { body: "Hello world!" },
  15551234567
);

// Image message
await whatsapp.messages.image(
  { link: "https://example.com/image.jpg" },
  15551234567
);

// Document message
await whatsapp.messages.document(
  { 
    link: "https://example.com/document.pdf",
    filename: "Important Document.pdf"
  },
  15551234567
);

// Template message
await whatsapp.messages.template(
  {
    name: "sample_shipping_confirmation",
    language: { code: "en_US" },
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: "John" },
          { type: "text", text: "12345" }
        ]
      }
    ]
  },
  15551234567
);

// Interactive message with buttons
await whatsapp.messages.interactive(
  {
    type: "button",
    body: { text: "Please select an option:" },
    action: {
      buttons: [
        { type: "reply", reply: { id: "btn1", title: "Option 1" } },
        { type: "reply", reply: { id: "btn2", title: "Option 2" } }
      ]
    }
  },
  15551234567
);
```

### Templates API

Work with message templates:

```typescript
// Get all templates
const templates = await whatsapp.template.getTemplates({
  limit: 20
});

// Create a new template
await whatsapp.template.createTemplate({
  name: "my_template",
  category: "MARKETING",
  language: "en_US",
  components: [
    {
      type: "HEADER",
      format: "TEXT",
      text: "Special Offer"
    },
    {
      type: "BODY",
      text: "Hi {{1}}, check out our latest offer: {{2}}!"
    }
  ]
});
```

### Media API

Handle media files:

```typescript
// Upload media
const mediaResponse = await whatsapp.media.uploadMedia(
  new File(['...'], 'image.jpg', { type: 'image/jpeg' })
);

// Get media details
const mediaDetails = await whatsapp.media.getMediaById(mediaResponse.id);

// Delete media
await whatsapp.media.deleteMedia(mediaResponse.id);
```

## Error Handling

The package provides standard error handling for Meta API responses:

```typescript
try {
  await whatsapp.messages.text(
    { body: "Hello world!" },
    15551234567
  );
} catch (error) {
  if (error.name === 'MetaError') {
    console.error(`Meta API Error: ${error.error.message}`);
    console.error(`Error Code: ${error.error.code}`);
    
    if (error.error.error_data) {
      console.error(`Details: ${error.error.error_data.details}`);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/froggy1014/meta-cloud-api/blob/main/LICENSE) file for details.

## Contributing

Contributions welcome! Please feel free to submit a Pull Request. 