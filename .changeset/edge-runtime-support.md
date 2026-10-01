---
'meta-cloud-api': minor
---

Run on Bun, Deno, Cloudflare Workers and Vercel Edge as well as Node.js. The bundle no longer has static `node:*` imports: webhook signatures and Flow encryption use Web Crypto, logging no longer needs `node:util`, and the unused `https.Agent` is gone.

New async helpers that work on every runtime: `verifyWebhookSignature`, `generateXHub256SigAsync`, `decryptFlowRequestAsync` and `encryptFlowResponseAsync`. The existing sync helpers keep working on Node.js 20.16+, Bun and Deno and now load `node:crypto` on demand. On runtimes without `node:crypto`, Flow private keys must be unencrypted PKCS#8.

Fix the User-Agent and `version()` always reporting `unknown`: the version is now inlined at build time, and the User-Agent names the actual runtime.

`profilePictureFile` and Flow JSON uploads accept any `Uint8Array` (a `Buffer` still works).
