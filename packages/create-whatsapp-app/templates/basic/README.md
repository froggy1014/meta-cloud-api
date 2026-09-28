# {{PROJECT_NAME}}

WhatsApp app built with [meta-cloud-api](https://github.com/froggy1014/meta-cloud-api), the TypeScript SDK for the official WhatsApp Cloud API.

```bash
{{PM_RUN}} dev
```

Open <http://localhost:3000>.

## Mock mode (default)

With no credentials in `.env.local` the app runs in mock mode. Type into the dashed **CUSTOMER** box. The text is wrapped in the same JSON Meta posts to your webhook and runs through the SDK's webhook processor. Your bot in `lib/bot.ts` answers exactly as it would in production. Replies are stored instead of sent.

## Going live

1. Create a Meta app with the WhatsApp product and copy the token, phone number ID, and WABA ID into `.env.local`. See the [configuration guide](https://meta-cloud-api.site/getting-started/configuration).
2. Expose the dev server, for example `cloudflared tunnel --url http://localhost:3000` or `ngrok http 3000`.
3. In the App Dashboard, go to WhatsApp → Configuration → Webhook:
   - Callback URL: `https://<your-tunnel>/api/webhook`
   - Verify token: the `WEBHOOK_VERIFICATION_TOKEN` in `.env.local`
   - Subscribe to the `messages` field
4. Restart `{{PM_RUN}} dev`. The badge turns green. Message your business number from your phone.

Set `APP_SECRET` so forged webhook POSTs are rejected.

## Files

| File | What it does |
|---|---|
| `lib/bot.ts` | **Your bot.** Called for every incoming text message |
| `lib/whatsapp.ts` | SDK client, mock/live switch, `sendText()` |
| `lib/webhook.ts` | SDK webhook processor: `onText`, `onStatus` |
| `lib/store.ts` | In-memory chat store + change feed. Replace with a database for production |
| `app/api/webhook/route.ts` | Meta webhook: GET verify, POST events, signature check |
| `app/api/simulate/route.ts` | Mock mode: fake customer messages as real webhook payloads |
| `app/api/send/route.ts` | Reply from the dashboard |
| `app/api/events/route.ts` | Server-Sent Events for the live UI |

## Next steps

- More message types: `wa.messages.image`, `interactiveReplyButtons`, `template`, … see the [API reference](https://meta-cloud-api.site/api/messages)
- More webhook events: `processor.onImage`, `onInteractive`, `onMessageTemplateStatusUpdate`, … see [webhooks](https://meta-cloud-api.site/)
- Live demo of everything: <https://playground.meta-cloud-api.site>
