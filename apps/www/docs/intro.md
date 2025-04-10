---
sidebar_position: 1
---

# Meta Cloud API Documentation

Welcome to the Meta Cloud API documentation. This guide will help you use our WhatsApp messaging APIs to build rich, interactive experiences for your users.

## Available APIs

- [Messages API](./messages/index.md) - Send various types of WhatsApp messages including text, media, interactive components, and more
- [Template API](./template-api.md) - Send pre-approved message templates for notifications and customer care
- [Phone Number API](./phone-number-api.md) - Manage WhatsApp business phone numbers and verification
- [QR Code API](./qr-code-api.md) - Create and manage QR codes and short links for WhatsApp conversations
- [Encryption API](./encryption-api.md) - Manage encryption for secure data exchange in WhatsApp Flows
- [Two-Step Verification API](./two-step-verification-api.md) - Set up and manage PIN-based security for your WhatsApp account
- [Registration API](./registration-api.md) - Register and deregister your business phone numbers with WhatsApp Cloud API
- [Media API](./media-api.md) - Upload, retrieve, download, and delete media files for use with WhatsApp messaging
- [WABA API](./waba-api.md) - Manage WhatsApp Business Accounts and their webhook subscriptions
- [Flow API](./flow-api.md) - Create and manage interactive WhatsApp Flows for collecting information from customers
- More APIs coming soon...

## Getting Started

### Installation

Install the Meta Cloud API package:

```bash
npm install meta-cloud-api
```

### Basic Setup

```typescript
import WhatsApp from 'meta-cloud-api';

// Initialize with configuration object
const whatsapp = new WhatsApp({
  phoneNumberId: YOUR_PHONE_NUMBER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN'
});

// You can also use environment variables (.env file)
// const whatsapp = new WhatsApp();

// Now you can use various API endpoints
// Example: Send a text message
const response = await whatsapp.messages.text(
  { body: "Hello from Meta Cloud API!" },
  15551234567
);
```

## About This Documentation

This documentation provides detailed guides and examples for using the Meta Cloud API. Each section includes:

- Complete API reference
- Code examples
- Parameter details
- Response formats

Use the sidebar to navigate between different API sections.
