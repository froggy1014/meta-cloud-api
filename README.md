<div align="center">
  <img src="public/README.svg" alt="meta-cloud-api" width="120">
  <h1>meta-cloud-api</h1>
  <p><strong>The actively maintained TypeScript SDK for the official WhatsApp Cloud API.</strong></p>
  <p>Meta <a href="https://github.com/WhatsApp/WhatsApp-Nodejs-SDK">archived their own Node.js SDK</a> in 2023. This one kept going.</p>

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

> **Meta's own WhatsApp Node.js SDK has been [archived since June 2023](https://github.com/WhatsApp/WhatsApp-Nodejs-SDK)** — no fixes, no updates, no OpenAPI v23 support. meta-cloud-api is a maintained, type-safe alternative built on the same official Cloud API.

| | meta-cloud-api | Official SDK | Unofficial libraries (whatsapp-web.js, Baileys) |
|---|---|---|---|
| API basis | Official Cloud API | Official Cloud API | Reverse-engineered, unofficial |
| Account ban risk | None | None | Yes — violates WhatsApp ToS |
| Maintenance | Active (tracks OpenAPI v23) | **Archived since 2023** | Varies |
| TypeScript | Strict, full request/response types | Partial | Varies |
| API coverage | 20 modules (Messages, Flows, Calling, Payments, and more) | Messaging-focused | Personal-account features |
| Webhook adapters | Built-in Express.js + Next.js | Manual | Custom event system |

If you're building on the official Cloud API and don't want to bet on an unmaintained SDK, this is what the archived one would look like if Meta had kept shipping it.

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
wa.contactBook           // Delete a BSUID contact book entry
wa.waba                  // WhatsApp Business Account management
```

## Webhooks

```typescript
import express from 'express';
import { expressWebhookHandler } from 'meta-cloud-api';

const app = express();
app.use(express.json());

// Handler is automatically cached per phoneNumberId — safe against HMR re-evaluation
const Whatsapp = expressWebhookHandler({
    accessToken: process.env.CLOUD_API_ACCESS_TOKEN,
    phoneNumberId: process.env.WA_PHONE_NUMBER_ID,
    webhookVerificationToken: process.env.WEBHOOK_VERIFICATION_TOKEN,
});

// Handle incoming text messages — echo back to sender
Whatsapp.processor.onText(async (wa, processed) => {
    const { message } = processed;
    await wa.messages.text({ to: message.from, body: `Echo: ${message.text.body}` });
});

// Handle message status updates
Whatsapp.processor.onStatus((wa, processed) => {
    const { status } = processed;
    console.log(`Message ${status.id}: ${status.status}`);
});

// Handle template status changes
Whatsapp.processor.onMessageTemplateStatusUpdate((wa, { value }) => {
    console.log(`Template "${value.message_template_name}" is now ${value.event}`);
});

// Mount on Express
app.get('/webhook', Whatsapp.GET);
app.post('/webhook', Whatsapp.POST);
```

All 30+ webhook field types are supported — messages, statuses, templates, flows, groups, calls, and more. See the [Webhooks documentation](https://meta-cloud-api.site/) for the full list of handlers.

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
