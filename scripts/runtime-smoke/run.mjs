// Runner for Node.js, Bun and Deno: `node|bun|deno run scripts/runtime-smoke/run.mjs`
import { runSmoke } from './smoke.mjs';

try {
    console.log(await runSmoke());
} catch (error) {
    console.error(error);
    if (typeof process !== 'undefined') process.exit(1);
    throw error;
}
