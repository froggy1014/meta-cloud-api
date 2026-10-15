---
'create-whatsapp-app': patch
---

Generated apps target `meta-cloud-api@^3.9.0`. The mock simulator builds its webhook payload with `createTextMessageWebhook` from `meta-cloud-api/testing`, the webhook route verifies signatures with the SDK's `verifyWebhookSignature`, and both routes pass a plain `Request` to the SDK handlers instead of wrapping it in `NextRequest`.
