---
'meta-cloud-api': minor
---

Webhook security and typing fixes.

- New `verifyWebhookSignature` config option. When `true`, webhook POSTs without a valid `X-Hub-Signature-256` are rejected with 401 before any handler runs. The HMAC is keyed with `appSecret`. It is off by default, so existing apps are unaffected. Turn it on in production. Express apps must keep the raw body, see the README.
- The Flow endpoint now verifies signatures with `appSecret`, which is the key Meta signs with. It previously used `webhookVerificationToken`, so real Meta Flow requests failed verification. The token is still used as a fallback when no `appSecret` is set.
- The signature check no longer throws on malformed or wrong-length headers.
- New export `isValidWebhookSignature(rawBody, header, appSecret)`.
- `nextjsAppWebhookHandler` returned `any` because of its internal cache. `processor.onText((wa, processed) => …)` now infers its parameter types again. The new `NextJsAppWebhookHandlers` type is exported.
