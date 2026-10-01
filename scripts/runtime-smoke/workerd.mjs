// Runs the smoke test inside Cloudflare's workerd (via Miniflare) with no
// Node.js compatibility flags, proving the bundle has no node:* dependency.
import { fileURLToPath } from 'node:url';
import { Miniflare } from 'miniflare';

const file = (path) => fileURLToPath(new URL(path, import.meta.url));

const worker = `
import { runSmoke } from './scripts/runtime-smoke/smoke.mjs';
export default {
    async fetch() {
        try {
            return new Response(await runSmoke());
        } catch (error) {
            return new Response(String(error && error.stack || error), { status: 500 });
        }
    },
};`;

const mf = new Miniflare({
    modules: [
        { type: 'ESModule', path: file('../../worker.mjs'), contents: worker },
        { type: 'ESModule', path: file('./smoke.mjs') },
        { type: 'ESModule', path: file('../../dist/index.mjs') },
        { type: 'ESModule', path: file('../../dist/chunk.mjs') },
    ],
    modulesRoot: file('../../'),
    compatibilityDate: '2026-07-01',
});

try {
    const response = await mf.dispatchFetch('http://localhost/');
    const text = await response.text();
    if (!response.ok) {
        console.error(text);
        process.exitCode = 1;
    } else {
        console.log(`workerd ${text}`);
    }
} finally {
    await mf.dispose();
}
