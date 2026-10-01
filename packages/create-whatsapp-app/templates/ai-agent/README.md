# {{PROJECT_NAME}}

WhatsApp AI agent built with [meta-cloud-api](https://github.com/froggy1014/meta-cloud-api), the TypeScript SDK for the official WhatsApp Cloud API, and [Claude](https://platform.claude.com/docs) through the official `@anthropic-ai/sdk`.

Every incoming text goes to Claude with a short per-user conversation history, and Claude's answer is sent back with the SDK's text message method. Photos, voice notes, and other non-text messages get a polite "text only" reply.

```bash
{{PM_RUN}} dev
```

Open <http://localhost:3000>.

## Mock mode (default)

With no credentials in `.env.local` the app runs in mock mode. Type into the dashed **CUSTOMER** box. The text is wrapped in the same JSON Meta posts to your webhook and runs through the SDK's webhook processor. Your bot in `lib/bot.ts` answers exactly as it would in production. Replies are stored instead of sent.

## Talking to Claude

Without `ANTHROPIC_API_KEY` the agent replies with a deterministic echo (`Echo: <your text>`), so mock mode and tests need no secrets. Add a key from the [Claude Console](https://console.anthropic.com/settings/keys) to `.env.local` and restart `{{PM_RUN}} dev`; replies now come from Claude.

Edit the system prompt in **`lib/prompt.ts`** to change who the agent is and what it may talk about.

| Variable | Default | |
|---|---|---|
| `ANTHROPIC_API_KEY` | empty: echo mode | Claude API key |
| `ANTHROPIC_MODEL` | `claude-sonnet-5-5` | Any Claude model ID. Effort and fallback tuning in `lib/agent.ts` apply only to the default model |

The default request uses low effort (fast, cheap chat replies) and server-side refusal fallback (`fallbacks: "default"`). History keeps the last 10 exchanges per user **in memory** (`lib/history.ts`): it is lost on restart and not shared between instances, so swap it for Redis or a database in production.

Meta expects a fast webhook response. Claude usually answers in a few seconds at low effort; for long-running work, acknowledge the webhook first and reply from a background job.

## Going live

1. Create a Meta app with the WhatsApp product and copy the token, phone number ID, and WABA ID into `.env.local`. See the [configuration guide](https://meta-cloud-api.site/getting-started/configuration).
2. Expose the dev server, for example `cloudflared tunnel --url http://localhost:3000` or `ngrok http 3000`.
3. In the App Dashboard, go to WhatsApp → Configuration → Webhook:
   - Callback URL: `https://<your-tunnel>/api/webhook`
   - Verify token: the `WEBHOOK_VERIFICATION_TOKEN` in `.env.local`
   - Subscribe to the `messages` field
4. Restart `{{PM_RUN}} dev`. The badge turns green. Message your business number from your phone.

Set `APP_SECRET` before going live; live webhook POSTs fail closed without it.

The live dashboard requires HTTP Basic authentication: username `admin`, password `DASHBOARD_PASSWORD` from `.env.local`. The CLI generates this password separately from the webhook verify token. This also protects sending messages and the conversation stream. Keep the password private and use HTTPS for the public tunnel. Mock mode needs no login.

## Files

| File | What it does |
|---|---|
| `lib/prompt.ts` | **System prompt.** Edit this to change the agent |
| `lib/bot.ts` | Called for every incoming message: text to Claude, polite reply otherwise |
| `lib/agent.ts` | Reply logic: Claude request, echo fallback, refusal and length handling |
| `lib/claude.ts` | `@anthropic-ai/sdk` client and model from env |
| `lib/history.ts` | In-memory per-user history. Replace with a database for production |
| `test/agent.test.ts` | Unit tests for the reply logic with a mock Claude client (`{{PM_RUN}} test`) |
| `lib/whatsapp.ts` | SDK client, mock/live switch, `sendText()` |
| `lib/webhook.ts` | SDK webhook processor: `onText`, non-text `onMessage`, `onStatus` |
| `lib/store.ts` | In-memory chat store + change feed. Replace with a database for production |
| `app/api/webhook/route.ts` | Meta webhook: GET verify, POST events, signature check |
| `app/api/simulate/route.ts` | Mock mode: fake customer messages as real webhook payloads |
| `app/api/send/route.ts` | Reply from the dashboard |
| `app/api/events/route.ts` | Server-Sent Events for the live UI |

## Next steps

- Claude API docs (tools, prompt caching, streaming): <https://platform.claude.com/docs>
- More message types: `wa.messages.image`, `interactiveReplyButtons`, `template`, … see the [API reference](https://meta-cloud-api.site/api/messages)
- More webhook events: `processor.onImage`, `onInteractive`, `onMessageTemplateStatusUpdate`, … see [webhooks](https://meta-cloud-api.site/)
- Live demo of everything: <https://playground.meta-cloud-api.site>
