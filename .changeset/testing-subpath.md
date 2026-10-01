---
'meta-cloud-api': minor
---

Add `meta-cloud-api/testing` for testing bots without a Meta account:

- Webhook payload factories typed with the SDK's webhook types: `createTextMessageWebhook`, `createImageMessageWebhook`, `createButtonReplyWebhook`, `createListReplyWebhook`, `createReactionWebhook`, `createLocationWebhook`, `createStatusWebhook`, `createMessageWebhook` and `createWebhookPayload(field, value)` for every other field, with `value` typed by `WebhookFieldValueMap`.
- `createSignedWebhookRequest()` builds a `Request` with a valid `X-Hub-Signature-256`.
- `createFlowRequest()`, `decryptFlowResponse()` and `generateFlowKeyPair()` encrypt Flow endpoint requests the way Meta does and read the encrypted reply.
- `createMockCloudApi()` is an in-memory Graph API installed on `globalThis.fetch`: it records every request, answers messages, media and template calls with realistic responses, and takes per-route overrides and Meta-shaped errors that surface as the SDK's `WhatsAppError` subclasses.

The subpath uses Web APIs only and imports the main bundle instead of copying it. `WebhookFieldType` and `WebhookFieldValue` are now exported as types, and `typesVersions` entries are arrays so subpath types resolve under `moduleResolution: node`.
