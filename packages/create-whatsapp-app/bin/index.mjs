#!/usr/bin/env node
// create-whatsapp-app — scaffold a WhatsApp Cloud API app on meta-cloud-api.
// Zero dependencies on purpose: `npx create-whatsapp-app` should start instantly.

import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { cpSync, existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = join(HERE, '..', 'templates');
const PKG = JSON.parse(readFileSync(join(HERE, '..', 'package.json'), 'utf8'));
const TEXT_EXT = new Set(['.ts', '.tsx', '.mjs', '.js', '.json', '.md', '.css', '.example', '']);

const tty = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const green = c(32);
const dim = c(2);
const bold = c(1);
const red = c(31);

// Shown in --help and the interactive picker. Any other template folder still works.
const TEMPLATE_INFO = {
    basic: { hint: 'Rule-based bot with a WhatsApp-style dashboard', edit: 'lib/bot.ts', what: 'the replies' },
    'ai-agent': {
        hint: 'Claude-powered agent with per-user memory (@anthropic-ai/sdk)',
        edit: 'lib/prompt.ts',
        what: "the agent's system prompt",
    },
};

function help() {
    console.log(`
${bold('create-whatsapp-app')} ${dim(`v${PKG.version}`)}

Usage
  npm create whatsapp-app@latest [dir] [options]
  npx create-whatsapp-app [dir] [options]

Options
  --template <name>   Template to use (default: basic)
${listTemplates()
    .map((t) => `                        ${t.padEnd(10)} ${dim(TEMPLATE_INFO[t]?.hint ?? '')}`)
    .join('\n')}
  --no-install        Skip installing dependencies
  --pm <npm|pnpm|yarn|bun>  Package manager (default: the one running this command)
  -y, --yes           Accept defaults, never prompt
  -h, --help          Show this help
  -v, --version       Print version
`);
}

function listTemplates() {
    const known = Object.keys(TEMPLATE_INFO);
    return readdirSync(TEMPLATES)
        .filter((d) => statSync(join(TEMPLATES, d)).isDirectory())
        .sort((a, b) => (known.indexOf(a) + 1 || 99) - (known.indexOf(b) + 1 || 99) || a.localeCompare(b));
}

async function pickTemplate(rl) {
    const templates = listTemplates();
    console.log(`${bold('Template')}`);
    for (const [i, t] of templates.entries()) {
        console.log(`  ${i + 1}) ${t.padEnd(10)} ${dim(TEMPLATE_INFO[t]?.hint ?? '')}`);
    }
    for (;;) {
        const answer = (await rl.question(`${bold('Choose')} ${dim('(1)')}: `)).trim();
        if (!answer) return templates[0];
        const picked = templates[Number(answer) - 1] ?? templates.find((t) => t === answer);
        if (picked) return picked;
        console.log(red(`  Pick 1-${templates.length} or a template name.`));
    }
}

function parseArgs(argv) {
    const opts = { dir: undefined, template: undefined, install: true, pm: undefined, yes: false };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '-h' || a === '--help') opts.help = true;
        else if (a === '-v' || a === '--version') opts.version = true;
        else if (a === '-y' || a === '--yes') opts.yes = true;
        else if (a === '--no-install') opts.install = false;
        else if (a === '--template' || a === '-t') opts.template = argv[++i];
        else if (a.startsWith('--template=')) opts.template = a.slice(11);
        else if (a === '--pm') opts.pm = argv[++i];
        else if (a.startsWith('--pm=')) opts.pm = a.slice(5);
        else if (a.startsWith('-')) throw new Error(`Unknown option ${a}`);
        else if (!opts.dir) opts.dir = a;
        else throw new Error(`Unexpected argument ${a}`);
    }
    return opts;
}

function detectPm() {
    const ua = process.env.npm_config_user_agent || '';
    if (ua.startsWith('pnpm')) return 'pnpm';
    if (ua.startsWith('yarn')) return 'yarn';
    if (ua.startsWith('bun')) return 'bun';
    return 'npm';
}

function toPackageName(dir) {
    return (
        basename(resolve(dir))
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/^[._]/, '')
            .replace(/[^a-z0-9-~._]+/g, '-') || 'whatsapp-app'
    );
}

function isEmptyDir(dir) {
    if (!existsSync(dir)) return true;
    return readdirSync(dir).filter((f) => f !== '.git' && f !== '.DS_Store').length === 0;
}

function walk(dir, out = []) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walk(p, out);
        else out.push(p);
    }
    return out;
}

function extOf(file) {
    const b = basename(file);
    const i = b.lastIndexOf('.');
    return i <= 0 ? '' : b.slice(i);
}

async function main() {
    const opts = parseArgs(process.argv.slice(2));
    if (opts.version) return console.log(PKG.version);
    if (opts.help) return help();

    const interactive = process.stdin.isTTY && !opts.yes;
    let dir = opts.dir;
    let template = opts.template;
    if (interactive && (!dir || !template)) {
        const rl = createInterface({ input: process.stdin, output: process.stdout });
        if (!dir)
            dir =
                (await rl.question(`${bold('Project name')} ${dim('(my-whatsapp-app)')}: `)).trim() ||
                'my-whatsapp-app';
        if (!template) template = await pickTemplate(rl);
        rl.close();
    }
    dir ||= 'my-whatsapp-app';
    template ||= 'basic';

    const templateDir = join(TEMPLATES, template);
    if (!/^[\w-]+$/.test(template) || !existsSync(templateDir))
        throw new Error(`Unknown template "${template}". Available: ${listTemplates().join(', ')}`);

    const target = resolve(dir);
    if (!isEmptyDir(target))
        throw new Error(`${relative(process.cwd(), target) || '.'} is not empty. Pick another name or empty it first.`);

    const pm = opts.pm || detectPm();
    if (!['npm', 'pnpm', 'yarn', 'bun'].includes(pm)) throw new Error(`Unsupported package manager "${pm}"`);
    const pmRun = pm === 'npm' ? 'npm run' : pm;
    const verifyToken = randomBytes(12).toString('hex');
    const vars = {
        PROJECT_NAME: toPackageName(dir),
        SDK_VERSION: PKG.config?.sdkVersion || '3.7.0',
        PM_RUN: pmRun,
        VERIFY_TOKEN: verifyToken,
        DASHBOARD_PASSWORD: randomBytes(24).toString('hex'),
    };

    console.log(`\n${green('◆')} Creating ${bold(vars.PROJECT_NAME)} ${dim(`(${template})`)} in ${dim(target)}`);
    cpSync(templateDir, target, { recursive: true });

    for (const file of walk(target)) {
        if (!TEXT_EXT.has(extOf(file))) continue;
        const src = readFileSync(file, 'utf8');
        const out = src.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
        if (out !== src) writeFileSync(file, out);
    }
    if (existsSync(join(target, '_gitignore'))) renameSync(join(target, '_gitignore'), join(target, '.gitignore'));
    // .env.local starts as a copy of .env.example: empty credentials = mock mode.
    cpSync(join(target, '.env.example'), join(target, '.env.local'));

    if (opts.install) {
        console.log(`${green('◆')} Installing dependencies with ${pm}…`);
        const r = spawnSync(pm, ['install'], { cwd: target, stdio: 'inherit', shell: process.platform === 'win32' });
        if (r.status !== 0)
            throw new Error(`${pm} install failed. Files were created in ${target}; run ${pm} install there to retry.`);
    }

    const cd = relative(process.cwd(), target);
    const info = TEMPLATE_INFO[template] ?? { edit: 'lib/bot.ts', what: 'the replies' };
    console.log(`
${green('✔')} Done.

  ${cd ? `cd ${cd}\n  ` : ''}${opts.install ? '' : `${pm} install\n  `}${pmRun} dev

Open ${bold('http://localhost:3000')} and message your bot as the customer.
No Meta account needed — you are in ${bold('mock mode')} until you fill in ${bold('.env.local')}.

Edit ${bold(info.edit)} to change ${info.what}.${
        template === 'ai-agent'
            ? `\nAdd ${bold('ANTHROPIC_API_KEY')} to ${bold('.env.local')} for Claude replies; without it the agent echoes.`
            : ''
    }
Docs: https://meta-cloud-api.site · Live demo: https://playground.meta-cloud-api.site
`);
}

main().catch((err) => {
    console.error(`\n${red('✖')} ${err.message}\n`);
    process.exit(1);
});
