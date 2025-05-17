# Next.js API Routes Example

This is a Next.js example project that demonstrates how to use API routes in the Pages Router to create backend endpoints.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the frontend.

## API Routes

API routes are defined in the `pages/api` directory. Each file in this directory is treated as an API endpoint.

## Project Structure

The project follows a simple structure:

```
pages/
├── api/                     # API route definitions
│   └── webhook.ts           # Webhook endpoint
├── index.tsx                # Home page
```

## Features

This example demonstrates various Next.js API features:

- Basic API endpoint handling
- Request and response helpers
- Disabling bodyParser for raw body access
- Type-safe API routes with TypeScript

## Disabling bodyParser

For certain use cases (like webhook endpoints), you may need to access the raw request body. Next.js automatically parses the request body, but you can disable this behavior:

```typescript
// pages/api/webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Access raw request body with req.body
  // You'll need to parse the body manually
  
  // Example using a raw-body package:
  // const rawBody = await getRawBody(req)
  
  res.status(200).json({ received: true })
}
```

## Webhook Setup

To receive messages from WhatsApp, you need to make your webhook publicly accessible. You can use a tool like ngrok for local development:

```
ngrok http 3000
```

Then set up your webhook in the Meta Developer Dashboard:

1. Go to [Webhook Setup](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/)
2. Set the webhook URL to your ngrok URL + "/webhook" (e.g., `https://your-ngrok-url.ngrok.io/api/webhook`)
3. Set the verify token to match your `WEBHOOK_VERIFICATION_TOKEN` in the `.env` file

## Environment Variables

- `PORT`: Port for the Express server (default: 3000)
- `CLOUD_API_ACCESS_TOKEN`: Your WhatsApp Cloud API access token
- `WA_PHONE_NUMBER_ID`: Your WhatsApp phone number ID
- `WA_BUSINESS_ACCOUNT_ID`: Your WhatsApp business account ID
- `WEBHOOK_VERIFICATION_TOKEN`: Verification token for webhook verification
- `DEBUG`: Enable debug mode (true/false)
