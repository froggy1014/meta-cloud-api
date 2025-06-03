# WhatsApp API Example Server

This is a Express.js example server that demonstrates how to use the meta-cloud-api package to handle WhatsApp Cloud API webhooks and send messages.

## Setup

1. Clone this repository
2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file based on the `env.example` file and fill in your WhatsApp API credentials:

   ```
   cp env.example .env
   ```

4. Start the development server:

   ```
   npm run dev
   ```

## Project Structure

The project follows a clean architecture:

```
src/
├── server.ts                 # Main entry point 
├── routes/
│   └── index.ts              # Route definitions
└── handlers/
    └── webhookHandler.ts     # All message handlers in one place
```

## Features

This example demonstrates various WhatsApp API features:

- Command-based responses (`hello`, `help`, `info`, etc.)
- Interactive button messages
- Template message support (requires approved template for your WhatsApp business account)
- Handling of different message types (text, image, document, interactive)
- Pre-processing of messages
- Clean architecture separating concerns

## Endpoints

- `GET /`: Simple homepage showing the server is running
- `GET /webhook`: WhatsApp webhook verification endpoint
- `POST /webhook`: WhatsApp webhook for receiving messages and events

## Webhook Setup

To receive messages from WhatsApp, you need to make your webhook publicly accessible. You can use a tool like ngrok for local development:

```
ngrok http 3000
```

Then set up your webhook in the Meta Developer Dashboard:

1. Go to [Webhook Setup](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/)
2. Set the webhook URL to your ngrok URL + "/webhook" (e.g., `https://your-ngrok-url.ngrok.io/webhook`)
3. Set the verify token to match your `WEBHOOK_VERIFICATION_TOKEN` in the `.env` file

## Environment Variables

- `PORT`: Port for the Express server (default: 3000)
- `CLOUD_API_ACCESS_TOKEN`: Your WhatsApp Cloud API access token
- `WA_PHONE_NUMBER_ID`: Your WhatsApp phone number ID
- `WA_BUSINESS_ACCOUNT_ID`: Your WhatsApp business account ID
- `WEBHOOK_VERIFICATION_TOKEN`: Verification token for webhook verification
- `DEBUG`: Enable debug mode (true/false)
