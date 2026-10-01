import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

const BIN = fileURLToPath(new URL('../bin/index.mjs', import.meta.url));
const work = mkdtempSync(join(tmpdir(), 'cwa-'));

function run(args) {
    return spawnSync(process.execPath, [BIN, ...args], {
        cwd: work,
        encoding: 'utf8',
        env: { ...process.env, NO_COLOR: '1' },
    });
}

afterAll(() => rmSync(work, { recursive: true, force: true }));

describe('create-whatsapp-app', () => {
    it('scaffolds the basic template with placeholders replaced', () => {
        const r = run(['My Bot', '--yes', '--no-install', '--pm', 'pnpm']);
        expect(r.status, r.stderr).toBe(0);

        const dir = join(work, 'My Bot');
        const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
        expect(pkg.name).toBe('my-bot');
        expect(pkg.dependencies['meta-cloud-api']).toMatch(/^\^\d+\.\d+\.\d+$/);

        // npm strips .gitignore from tarballs, so the template ships _gitignore.
        expect(existsSync(join(dir, '.gitignore'))).toBe(true);
        expect(existsSync(join(dir, '_gitignore'))).toBe(false);

        // Empty credentials in .env.local = mock mode out of the box.
        const env = readFileSync(join(dir, '.env.local'), 'utf8');
        expect(env).toMatch(/^CLOUD_API_ACCESS_TOKEN=$/m);
        expect(env).toMatch(/^WEBHOOK_VERIFICATION_TOKEN=[0-9a-f]{24}$/m);
        expect(env).toMatch(/^DASHBOARD_PASSWORD=[0-9a-f]{48}$/m);
        expect(existsSync(join(dir, 'proxy.ts'))).toBe(true);

        expect(readFileSync(join(dir, 'README.md'), 'utf8')).toContain('pnpm dev');
        for (const f of ['package.json', 'README.md', 'app/layout.tsx', 'app/page.tsx', '.env.local']) {
            expect(readFileSync(join(dir, f), 'utf8'), f).not.toMatch(/\{\{\w+\}\}/);
        }
        expect(r.stdout).toContain('mock mode');
    });

    it('scaffolds the ai-agent template with Claude wiring and echo-mode env', () => {
        const r = run(['agent', '--yes', '--no-install', '--pm', 'npm', '--template', 'ai-agent']);
        expect(r.status, r.stderr).toBe(0);

        const dir = join(work, 'agent');
        const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
        expect(pkg.dependencies['@anthropic-ai/sdk']).toBeDefined();
        expect(pkg.scripts.test).toBe('vitest run');

        // Empty key = deterministic echo replies, so mock mode needs no secrets.
        const env = readFileSync(join(dir, '.env.local'), 'utf8');
        expect(env).toMatch(/^ANTHROPIC_API_KEY=$/m);
        expect(env).toMatch(/^ANTHROPIC_MODEL=$/m);
        expect(env).toMatch(/^WEBHOOK_VERIFICATION_TOKEN=[0-9a-f]{24}$/m);

        for (const f of ['lib/prompt.ts', 'lib/agent.ts', 'lib/history.ts', 'test/agent.test.ts', 'proxy.ts']) {
            expect(existsSync(join(dir, f)), f).toBe(true);
        }
        expect(readFileSync(join(dir, 'README.md'), 'utf8')).toContain('npm run dev');
        for (const f of ['package.json', 'README.md', 'app/layout.tsx', '.env.local']) {
            expect(readFileSync(join(dir, f), 'utf8'), f).not.toMatch(/\{\{\w+\}\}/);
        }
        expect(r.stdout).toContain('lib/prompt.ts');
    });

    it('lists templates in --help', () => {
        const r = run(['--help']);
        expect(r.stdout).toContain('basic');
        expect(r.stdout).toContain('ai-agent');
    });

    it('refuses a non-empty directory', () => {
        const r = run(['My Bot', '--yes', '--no-install']);
        expect(r.status).toBe(1);
        expect(r.stderr).toContain('is not empty');
    });

    it('rejects an unknown template', () => {
        for (const template of ['nope', '../basic']) {
            const r = run(['other', '--yes', '--no-install', '--template', template]);
            expect(r.status).toBe(1);
            expect(r.stderr).toContain('Unknown template');
        }
    });
});
