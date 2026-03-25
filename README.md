<div align="center">
  <img src="public/README.svg" alt="meta-cloud-api" width="120">
  <h1>meta-cloud-api</h1>
  <p><strong>WhatsApp TypeScript SDK</strong> — type-safe, modular, and production-ready.</p>
  <p>The complete SDK for the official <a href="https://developers.facebook.com/docs/whatsapp/cloud-api">WhatsApp Business Platform Cloud API</a>.</p>

  [![npm version](https://img.shields.io/npm/v/meta-cloud-api.svg)](https://www.npmjs.com/package/meta-cloud-api)
  [![npm downloads](https://img.shields.io/npm/dm/meta-cloud-api.svg)](https://www.npmjs.com/package/meta-cloud-api)
  [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/froggy1014/meta-cloud-api/blob/main/LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)

  <p><a href="https://meta-cloud-api.site/">Docs</a> · <a href="https://playground.meta-cloud-api.site/">Playground</a> · <a href="https://meta-cloud-api.site/getting-started/installation">Getting Started</a></p>

</div>

## Quick Start

```bash
pnpm add meta-cloud-api
```

```typescript
import WhatsApp from 'meta-cloud-api';

const wa = new WhatsApp({
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN,
    phoneNumberId: process.env.WA_PHONE_NUMBER_ID,
});

// Send a text message
await wa.messages.text({ to: '1234567890', body: 'Hello from TypeScript!' });

// Send a template message
await wa.messages.template({
    to: '1234567890',
    name: 'hello_world',
    language: { code: 'en_US' },
});

// Send an image
await wa.messages.image({ to: '1234567890', link: 'https://example.com/image.png' });
```

## Why meta-cloud-api?

| | meta-cloud-api |
|---|---|
| **Type Safety** | Full TypeScript strict mode — every request and response is typed |
| **17 API Modules** | Messages, Media, Templates, Flows, Groups, Calling, Payments, and more |
| **Webhook Adapters** | Built-in support for Express.js and Next.js (App Router & Pages Router) |
| **Modular** | Tree-shakeable imports, use only what you need |
| **Production Ready** | Error handling, typed error classes, rate limit support |
| **Official API** | Built on the official WhatsApp Business Platform Cloud API |

## API Coverage

```
wa.messages              // Text, image, video, document, audio, sticker, location, contact, template, interactive, reaction
wa.media                 // Upload, get, delete media
wa.templates             // Create, list, delete message templates
wa.flows                 // WhatsApp Flows management
wa.groups                // Group management
wa.calling               // Voice calling
wa.payments              // Payment processing (India)
wa.businessProfile       // Business profile management
wa.phoneNumbers          // Phone number management
wa.commerce              // Commerce settings
wa.marketingMessages     // Marketing message management
wa.qrCode               // QR code generation
wa.registration          // Phone registration
wa.twoStepVerification   // 2FA management
wa.encryption            // End-to-end encryption
wa.blockUsers            // Block/unblock users
wa.waba                  // WhatsApp Business Account management
```

## Webhooks

```typescript
import { createExpressWebhookHandler } from 'meta-cloud-api/webhooks';

app.post('/webhook', createExpressWebhookHandler({
    verifyToken: process.env.WEBHOOK_VERIFY_TOKEN,
    onMessage: (message) => {
        console.log('Received:', message);
    },
}));
```

## Requirements

- **Node.js** 18 LTS or later
- **TypeScript** 4.5+ (for TypeScript projects)

## Resources

- **[Documentation](https://meta-cloud-api.site/)** — Guides, API reference, and examples
- **[Getting Started](https://meta-cloud-api.site/getting-started/installation)** — Setup in 5 minutes
- **[API Reference](https://meta-cloud-api.site/api/messages)** — Every endpoint documented
- **[Examples](./examples/)** — Express, Next.js App Router, Pages Router

## Examples

| Example | Description |
|---|---|
| [express-simple](./examples/express-simple/) | Basic Express.js integration |
| [express-production](./examples/express-production/) | Production-ready with conversation flows, DB, and queues |
| [nextjs-app-router](./examples/nextjs-app-router-example/) | Next.js App Router integration |
| [nextjs-pages-router](./examples/nextjs-page-router-example/) | Next.js Pages Router integration |

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see the [LICENSE](LICENSE) file for details.
