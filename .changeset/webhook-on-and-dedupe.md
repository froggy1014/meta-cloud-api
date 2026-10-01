---
'meta-cloud-api': minor
---

Add `processor.on(field, handler)` and `processor.off(field)` for every webhook field except `messages`. The type of `processed.value` follows from the field name, so `on('calls', (wa, { value }) => ...)` gets `CallsWebhookValue['value']`. The existing `onXxx` field methods now call `on()` and behave the same. `on('messages')` throws: use `onMessage`, `onStatus` or `onUserAction` for that field. New exported types: `WebhookFieldValueMap`, `NonMessageWebhookField`, `WebhookFieldHandler` and `ProcessedWebhookField`.

Add opt-in webhook deduplication with the `dedupe` config option. Meta retries deliveries, so the same message or status can arrive twice; with `dedupe` on, handlers are skipped for deliveries already seen and the response is still 200. Messages are keyed by message id, statuses by message id and status, and `calls`, `smb_message_echoes` and `message_echoes` by their ids; other fields are not deduped. `dedupe: true` uses the new `MemoryDedupeStore` (bounded, single instance only). Pass `{ store, ttlSeconds }` with your own `DedupeStore`, whose `setIfAbsent(key, ttlSeconds)` maps 1:1 to Redis `SET NX EX`. Store errors are logged and the webhook is processed anyway.

`processWebhookMessages` accepts a `fieldHandlers` map and a `dedupe` option; its existing named handler options keep working.
