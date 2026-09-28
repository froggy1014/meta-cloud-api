---
'meta-cloud-api': patch
---

Add a default export for the `WhatsApp` class. `import WhatsApp from 'meta-cloud-api'`, the form used in the README Quick Start and the docs, previously threw `does not provide an export named 'default'` in plain Node ESM. The named export `{ WhatsApp }` is unchanged.
