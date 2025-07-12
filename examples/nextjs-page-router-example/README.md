# Next.js WhatsApp Echo Bot

A simple WhatsApp echo bot built with Next.js that responds to incoming messages.

## Features

- Echo text messages with "Echo: [message]" prefix
- Handle media messages (images, documents, audio, video, etc.)
- Auto-mark messages as read
- Webhook verification

## Quick Start

1. **Install dependencies**
```bash
cd examples/nextjs-page-router-example
npm install
```

2. **Setup environment**
```bash
cp env.example .env.local
```

Edit `.env.local`:
```env
CLOUD_API_ACCESS_TOKEN=your_access_token
WA_PHONE_NUMBER_ID=your_phone_number_id
WA_BUSINESS_ACCOUNT_ID=your_business_account_id
WEBHOOK_VERIFICATION_TOKEN=your_verification_token
```

3. **Run development server**
```bash
npm run dev
```

## Webhook Setup

### Local Development
1. Use ngrok: `ngrok http 3000`
2. Set webhook URL in Meta Dashboard: `https://your-ngrok-url.ngrok.io/api/webhook`

### Production
Deploy to Vercel/Netlify and use production URL for webhook.

## How It Works

- Text messages → "Echo: [your message]"
- Media messages → Acknowledgment response
- All messages marked as read automatically

## Project Structure

```
src/
├── pages/api/webhook.ts     # Webhook endpoint
├── lib/webhookHandler.ts    # Bot logic
└── pages/index.tsx          # Home page
```

## Environment Variables

Required in `.env.local`:
- `CLOUD_API_ACCESS_TOKEN` - WhatsApp Cloud API token
- `WA_PHONE_NUMBER_ID` - Phone number ID
- `WA_BUSINESS_ACCOUNT_ID` - Business account ID  
- `WEBHOOK_VERIFICATION_TOKEN` - Webhook verification token

## Troubleshooting

- **Webhook fails**: Check verification token matches Meta Dashboard
- **No echo**: Verify access token and phone number ID
- **Local issues**: Ensure ngrok is running with correct URL
