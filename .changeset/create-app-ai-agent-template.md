---
'create-whatsapp-app': minor
---

Add an `ai-agent` template (`--template ai-agent`, also offered in the interactive prompt). The generated app answers WhatsApp messages with Claude through the official `@anthropic-ai/sdk`, keeps a short in-memory history per user, replies politely to non-text messages, and falls back to a deterministic echo when `ANTHROPIC_API_KEY` is not set so mock mode needs no secrets.
