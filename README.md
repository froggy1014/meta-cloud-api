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

## Local API Docs

- [API examples index](./docs/README.md)

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

## More Examples

- [API examples index](./docs/README.md)
- [Express.js Echo Bot](./examples/express-example)
- [Next.js App Router Echo Bot](./examples/nextjs-app-router-example)
- [Next.js Page Router Echo Bot](./examples/nextjs-page-router-example)

## Requirements

- **Node.js** 18 LTS or later
- **TypeScript** 4.5+ (for TypeScript projects)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
