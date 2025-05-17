# WhatsApp Webhook Examples

This directory contains examples for testing WhatsApp webhooks locally.

## Local Webhook Server

### Features
- Receive and process webhook events from WhatsApp
- Verify webhook URLs for Meta API integration
- Respond to incoming messages automatically
- Easy testing with ngrok for local development

## Project Structure

The codebase is organized as follows:

```
examples/
├── app.ts                # Main entry point
├── src/
│   ├── app.ts            # Application initialization
│   ├── config.ts         # Environment variables and configuration
│   ├── server.ts         # Express server setup and startup
│   ├── handlers/
│   │   ├── index.ts      # Message handling coordination
│   │   └── messageHandlers.ts # Handlers for different message types
│   └── webhooks/
│       └── index.ts      # Webhook routes and processing
├── package.json
├── tsconfig.json
└── .env                  # Environment variables (create from env.example)
```

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- ngrok (for exposing your local server to the internet)

### Setup

1. **Create a `.env` file**

   Copy the example environment file and fill in your values:
   ```bash
   cp env.example .env
   ```

   You'll need to set:
   - `CLOUD_API_ACCESS_TOKEN`: Your WhatsApp Business API token
   - `WA_PHONE_NUMBER_ID`: Your WhatsApp Phone Number ID
   - `VERIFY_TOKEN`: A secret token of your choice (for webhook verification)

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the server**

   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

   To build TypeScript to JavaScript:
   ```bash
   npm run build
   ```

### Exposing your webhook to the internet

For WhatsApp to send webhook events to your local server, you need to expose it to the internet. The easiest way is to use [ngrok](https://ngrok.com/).

1. **Install ngrok**

   ```bash
   npm install -g ngrok
   ```
   
   Or download from [ngrok.com/download](https://ngrok.com/download)

2. **Start ngrok**

   ```bash
   ngrok http 3000
   ```
   
   This will give you a public URL (e.g., `https://abc123.ngrok.io`) that forwards to your local server.

3. **Update your webhook URL in the Meta Developer Portal**

   1. Go to [Meta Developer Portal](https://developers.facebook.com/)
   2. Navigate to your WhatsApp app
   3. Go to WhatsApp > Configuration
   4. In the Webhook section:
      - Set Callback URL to your ngrok URL + `/webhook` (e.g., `https://abc123.ngrok.io/webhook`)
      - Set Verify Token to the value of `VERIFY_TOKEN` in your `.env` file
      - Select the subscription fields you want to receive (at minimum, select `messages`)

4. **Test your webhook**

   Send a message to your WhatsApp business number. You should see logs in your terminal showing the incoming message, and the user should receive an automated reply.

## Customizing Message Handlers

To customize how the server responds to different message types:

1. Navigate to `src/handlers/messageHandlers.ts`
2. Modify the relevant handler function (e.g., `handleTextMessage`, `handleImageMessage`, etc.)
3. Implement your custom business logic

## Troubleshooting

- **Webhook verification fails**: Make sure your ngrok URL is correct and your verify token matches exactly
- **No webhook events received**: Ensure you've subscribed to the appropriate fields in the Meta Developer Portal
- **Authorization errors**: Check that your API token and phone number ID are correct
- **Path issues**: If you're getting "module not found" errors, check the import paths are correct for your environment

## Next Steps

Once your webhook is working locally, you can:
1. Customize the message handlers in `src/handlers/messageHandlers.ts` to implement your specific business logic
2. Deploy the webhook to a production server for permanent availability
3. Implement more sophisticated features like interactive messages, flow handling, etc.

For production, make sure to:
- Implement proper X-Hub-Signature-256 validation for security
- Set up proper logging and monitoring
- Add error handling and retry logic
- Consider using a database for message persistence 