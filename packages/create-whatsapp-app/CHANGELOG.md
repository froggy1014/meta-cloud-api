# create-whatsapp-app

## 0.3.1

### Patch Changes

- 0e91b55: Generated apps target `meta-cloud-api@^3.9.0`. The mock simulator builds its webhook payload with `createTextMessageWebhook` from `meta-cloud-api/testing`, the webhook route verifies signatures with the SDK's `verifyWebhookSignature`, and both routes pass a plain `Request` to the SDK handlers instead of wrapping it in `NextRequest`.

## 0.3.0

### Minor Changes

- 25fa76c: Add an `ai-agent` template (`--template ai-agent`, also offered in the interactive prompt). The generated app answers WhatsApp messages with Claude through the official `@anthropic-ai/sdk`, keeps a short in-memory history per user, replies politely to non-text messages, and falls back to a deterministic echo when `ANTHROPIC_API_KEY` is not set so mock mode needs no secrets.

## 0.2.0

### Minor Changes

- a724b37: New package: `npm create whatsapp-app@latest` scaffolds a Next.js WhatsApp app on meta-cloud-api. It starts in mock mode with no Meta account. Customer messages typed in the browser are sent as real Cloud API webhook payloads through the SDK, so the bot you write locally is the bot that runs in production.
