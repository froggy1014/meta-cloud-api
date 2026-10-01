---
'meta-cloud-api': minor
---

Add Hono and Fastify webhook adapters. `honoWebhookHandler(config)` takes a Hono `Context` and returns a web `Response`, so it runs on Node.js, Bun, Deno, Cloudflare Workers and Vercel Edge. `fastifyWebhookHandler(config)` takes `(request, reply)`; for `verifyWebhookSignature: true`, keep the raw body as `request.rawBody` (a content-type parser or `fastify-raw-body`), otherwise it falls back to `JSON.stringify(request.body)`. Both return `{ GET, POST, webhook, flow, processor, destroy }`, are cached per `phoneNumberId`, and need no new dependencies. NestJS works with `expressWebhookHandler` (or `fastifyWebhookHandler` on the Fastify platform).
