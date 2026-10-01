#!/usr/bin/env node
// Type-check the ```typescript / ```ts code blocks of selected docs pages against src/.
//
// Usage: node scripts/check-doc-snippets.mjs <file.mdx> [more.mdx...]
//
// Each block is written to its own module under .doc-snippets/ and compiled with
// `tsc --noEmit`, with `meta-cloud-api` resolved to src/index.ts. Blocks must be
// self-contained (imports included). Blocks in other languages (```js, ```bash) are
// ignored, which is how "before" code for other libraries is kept out of the check.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = process.argv.slice(2);
if (files.length === 0) {
    console.error('usage: node scripts/check-doc-snippets.mjs <file.mdx> [...]');
    process.exit(2);
}

const outDir = join(root, '.doc-snippets');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const fence = /^([ \t]*)```(typescript|ts)\b[^\n]*\n([\s\S]*?)^\1```[ \t]*$/gm;
const sources = [];

for (const file of files) {
    const abs = resolve(file);
    const text = readFileSync(abs, 'utf8');
    for (const match of text.matchAll(fence)) {
        const indent = match[1] ?? '';
        const line = text.slice(0, match.index).split('\n').length;
        const code = (match[3] ?? '')
            .split('\n')
            .map((l) => (l.startsWith(indent) ? l.slice(indent.length) : l))
            .join('\n');
        const name = `${relative(root, abs).replace(/[^a-zA-Z0-9]+/g, '_')}_L${line}.ts`;
        writeFileSync(join(outDir, name), `// ${relative(root, abs)}:${line}\n${code}`);
        sources.push(name);
    }
}

if (sources.length === 0) {
    console.error('No typescript blocks found.');
    process.exit(1);
}

writeFileSync(
    join(outDir, 'tsconfig.json'),
    JSON.stringify(
        {
            extends: '../tsconfig.json',
            compilerOptions: {
                noEmit: true,
                rootDir: '..',
                module: 'ESNext',
                declaration: false,
                declarationMap: false,
                paths: {
                    'meta-cloud-api': ['../src/index.ts'],
                    '@core/*': ['../src/core/*'],
                    '@api/*': ['../src/api/*'],
                    '@shared/*': ['../src/shared/*'],
                },
            },
            include: sources,
        },
        null,
        4,
    ),
);

console.log(`Type-checking ${sources.length} snippet(s) from ${files.length} file(s)...`);
try {
    execFileSync(join(root, 'node_modules', '.bin', 'tsc'), ['-p', join(outDir, 'tsconfig.json')], {
        stdio: 'inherit',
        cwd: root,
    });
    console.log('All snippets type-check.');
} catch {
    console.error('\nSnippet type check failed. Each file in .doc-snippets/ starts with its source location.');
    process.exit(1);
}
