---
sidebar_position: 2
---

# Quick Start Examples

Below are examples to help you quickly start using the Meta Cloud API wrapper for WhatsApp.

## Basic Example

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize with configuration object
const whatsapp = new WhatsApp({
  phoneNumberId: 'YOUR_PHONE_NUMBER_ID',
  accessToken: 'YOUR_ACCESS_TOKEN'
});

// Send a simple text message
const response = await whatsapp.messages.text(
  { body: "Hello from Meta Cloud API!" },
  "15551234567" // Recipient's phone number
);

console.log(`Message sent with ID: ${response.messages[0].id}`);
```

## Example Implementations

See our complete example implementations:

- [Next.js Page Router Example](https://github.com/froggy1014/meta-cloud-api/tree/main/packages/meta-cloud-api/examples/nextjs-page-router-example)
- [Express.js Example](https://github.com/froggy1014/meta-cloud-api/tree/main/packages/meta-cloud-api/examples/express-example)

For more information about the WhatsApp Cloud API itself, refer to the [official Meta documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/).
