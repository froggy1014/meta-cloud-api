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

## Templates

| Template | What you get |
|---|---|
| `basic` (default) | Rule-based bot in `lib/bot.ts` |
| `ai-agent` | Claude-powered agent via the official `@anthropic-ai/sdk`: per-user in-memory history, system prompt in `lib/prompt.ts`, polite replies to non-text messages, unit tests with a mock Claude client |

```bash
npm create whatsapp-app@latest my-agent -- --template ai-agent
```

The interactive prompt asks for a template when `--template` is not given. The `ai-agent` template reads `ANTHROPIC_API_KEY` (and optional `ANTHROPIC_MODEL`, default `claude-sonnet-5-5`) from `.env.local`. Without a key it replies with a deterministic echo, so mock mode runs end to end with no secrets.

## Options

```
npx create-whatsapp-app [dir] [--template basic|ai-agent] [--pm npm|pnpm|yarn|bun] [--no-install] [--yes]
```
