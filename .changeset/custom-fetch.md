---
'meta-cloud-api': minor
---

Add a `fetch` config option so every Graph API request goes through a caller-supplied `fetch`: route traffic through a proxy (for example `undici`'s `ProxyAgent`), add tracing, or intercept a single client in tests with `createMockCloudApi().fetch`. Defaults to the global `fetch`, resolved at call time.
