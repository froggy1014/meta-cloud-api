# create-whatsapp-app

Scaffold a WhatsApp Cloud API app in 30 seconds. No Meta account needed to start.

```bash
npm create whatsapp-app@latest my-bot
cd my-bot && npm run dev
```

Open <http://localhost:3000>. You are the customer. Type a message and the bot in `lib/bot.ts` answers.

![Mock mode: the customer types in the browser and the bot replies with read receipts](https://raw.githubusercontent.com/froggy1014/meta-cloud-api/main/packages/create-whatsapp-app/docs/mock-mode.png)

## How mock mode works

Your message is wrapped in the exact JSON Meta posts to your webhook. It runs through [meta-cloud-api](https://github.com/froggy1014/meta-cloud-api)'s webhook processor, so the bot code you write in mock mode is the code that runs in production. Fill in `.env.local` and the same app talks to real WhatsApp users.

## What you get

- Next.js App Router, TypeScript strict
- Webhook route with GET verification, POST events, and `X-Hub-Signature-256` check
- WhatsApp-style dashboard with live updates over Server-Sent Events, including read receipts
- `sendText()` that works in both modes
- Zero-dependency CLI

## Options

```
npx create-whatsapp-app [dir] [--template basic] [--pm npm|pnpm|yarn|bun] [--no-install] [--yes]
```
