#!/usr/bin/env node
/**
 * crawl-changelog.mjs — Track Meta WhatsApp Business Platform Changelog
 * and maintain implementation status in CHANGELOG.md.
 *
 * Modes:
 *   node crawl-changelog.mjs                    # Fetch RSS (recent ~20 entries, no deps)
 *   node crawl-changelog.mjs --full             # Full crawl via Playwright (all entries)
 *   node crawl-changelog.mjs --show             # Show current checklist
 *   node crawl-changelog.mjs --show --filter X  # Filter by keyword
 *   node crawl-changelog.mjs --mark "3"         # Mark item #3 as done
 *   node crawl-changelog.mjs --mark "3,4,5"     # Mark multiple items
 *   node crawl-changelog.mjs --unmark "3"       # Unmark item
 *   node crawl-changelog.mjs --new-only         # Show only new (unchecked) items as JSON
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SKILL_DIR = resolve(import.meta.dirname);
const PROJECT_ROOT = resolve(SKILL_DIR, '..', '..', '..');
const CHANGELOG_MD = join(PROJECT_ROOT, 'CLOUD_API_CHANGELOG.md');
const RSS_URL =
  'https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog/rss/';
const CHANGELOG_URL =
  'https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog';

// ── CLI args ──
const args = process.argv.slice(2);
const showOnly = args.includes('--show');
const fullCrawl = args.includes('--full');
const newOnly = args.includes('--new-only');
const markIdx = args.indexOf('--mark');
const unmarkIdx = args.indexOf('--unmark');
const filterIdx = args.indexOf('--filter');
const markTarget = markIdx !== -1 ? args[markIdx + 1] : null;
const unmarkTarget = unmarkIdx !== -1 ? args[unmarkIdx + 1] : null;
const filterKeyword = filterIdx !== -1 ? args[filterIdx + 1] : null;

// ── 1. RSS fetch (default, no dependencies) ──

async function fetchRSS() {
  console.log('Fetching WhatsApp API Changelog RSS...');
  const res = await fetch(RSS_URL);
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const xml = await res.text();
  return parseRSS(xml);
}

function parseRSS(xml) {
  const entries = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, 'title');
    const description = extractTag(itemXml, 'description');
    const link = extractTag(itemXml, 'link');
    const pubDate = extractTag(itemXml, 'pubDate');

    if (!title || !description) continue;

    entries.push({ date: title, description: description.trim(), link, pubDate });
  }

  return entries;
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').trim() : null;
}

// ── 2. Full Playwright crawl (optional, --full flag) ──

async function fullPlaywrightCrawl() {
  const { chromium } = await import('playwright');

  async function launchBrowser() {
    const cachedPaths = [
      join(process.env.HOME, 'Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'),
      join(process.env.HOME, 'Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'),
    ];
    const executablePath = cachedPaths.find((p) => existsSync(p));
    return chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  }

  console.log('Launching Playwright for full changelog crawl...');
  const browser = await launchBrowser();
  const page = await (await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  })).newPage();

  await page.goto(CHANGELOG_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Auto-scroll
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const timer = setInterval(() => {
        window.scrollBy(0, 1000);
        total += 1000;
        if (total >= document.body.scrollHeight || total > 50000) { clearInterval(timer); resolve(); }
      }, 200);
    });
  });
  await page.waitForTimeout(1000);

  const rawText = await page.evaluate(() => (document.querySelector('main') || document.body)?.innerText || '');
  await browser.close();

  return parseRawChangelog(rawText);
}

const DATE_REGEX = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}$/;

function parseRawChangelog(rawText) {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const entries = [];
  let startIdx = lines.findIndex((l) => DATE_REGEX.test(l));
  if (startIdx === -1) return entries;

  let currentDate = null;
  let i = startIdx;

  while (i < lines.length) {
    const line = lines[i];
    if (DATE_REGEX.test(line)) { currentDate = line; i++; continue; }

    if (currentDate && isCategoryTag(line)) {
      const tags = line;
      i++;
      let description = '';
      while (i < lines.length) {
        const next = lines[i];
        if (DATE_REGEX.test(next)) break;
        if (isCategoryTag(next) && description.length > 0) break;
        if (isFooterContent(next)) break;
        if (description.length > 0) description += '\n';
        description += next;
        i++;
      }
      if (description.length > 0) {
        entries.push({ date: currentDate, tags, description: description.trim() });
      }
      continue;
    }
    i++;
  }
  return entries;
}

function isCategoryTag(line) {
  if (line.length > 100 || line.length < 3) return false;
  const knownTags = [
    'cloud api', 'business management api', 'webhooks', 'message templates',
    'embedded signup', 'in-app signup', 'flows', 'marketing messages',
    'mm lite', 'pricing', 'groups api', 'calling', 'conversational components',
    'conversational automation', 'whatsapp business account',
    'solution migration', 'multi-partner solutions', 'catalog',
    'whatsapp business account users', 'payments', 'commerce',
    'data, privacy, & policy', 'support', 'analytics',
  ];
  const lower = line.toLowerCase();
  if (knownTags.some((tag) => lower.includes(tag))) return true;
  if (/^[A-Z][\w\s&,-]+$/.test(line) && line.length < 60 && !line.includes('.')) return true;
  return false;
}

function isFooterContent(line) {
  const lower = line.toLowerCase();
  return lower.includes('build with us') || lower.includes('developer centers') ||
    lower.includes('privacy policy') || lower === 'login' || lower === 'docs';
}

// ── 3. CHANGELOG.md management ──

function parseChangelogMdFull() {
  if (!existsSync(CHANGELOG_MD)) return { entries: [], maxId: -1 };
  const content = readFileSync(CHANGELOG_MD, 'utf-8');
  const entries = [];
  let maxId = -1;

  let currentDate = null;
  for (const line of content.split('\n')) {
    if (line.startsWith('## ')) {
      currentDate = line.replace('## ', '').trim();
      continue;
    }
    const match = line.match(/^- \[([ x])\] \*\*#(\d+)\*\* (?:\[(.+?)\] )?(.+)$/);
    if (match) {
      const id = parseInt(match[2], 10);
      if (id > maxId) maxId = id;
      entries.push({
        id,
        implemented: match[1] === 'x',
        tags: match[3] || null,
        description: match[4],
        date: currentDate,
      });
    }
  }
  return { entries, maxId };
}

function writeChangelogMd(newEntries, source) {
  const { entries: existing, maxId } = parseChangelogMdFull();

  // Build a set of existing description prefixes to detect duplicates
  const existingKeys = new Set(existing.map((e) => e.description.substring(0, 100)));

  // Filter to only truly new entries
  const brandNew = newEntries.filter((e) => {
    const key = (e.description || '').substring(0, 100);
    return !existingKeys.has(key);
  });

  if (brandNew.length === 0 && existing.length > 0) {
    console.log('No new entries to add.');
    const total = existing.length;
    const done = existing.filter((e) => e.implemented).length;
    return { totalItems: total, checkedItems: done, pct: Math.round((done / total) * 100) };
  }

  // If no existing file, do a full write (first-time or --full mode)
  if (existing.length === 0) {
    return writeChangelogMdFull(newEntries, source);
  }

  // Assign new IDs starting after the current max
  let nextId = maxId + 1;
  const newTracked = brandNew.map((entry) => ({
    id: nextId++,
    date: entry.date,
    tags: entry.tags || null,
    description: entry.description,
    implemented: false,
  }));

  // Merge: new entries + existing entries, newest-first
  const all = [...newTracked, ...existing];

  return renderChangelogMd(all, source);
}

function writeChangelogMdFull(entries, source) {
  // Reverse so oldest entries get the lowest IDs (stable numbering)
  const reversed = [...entries].reverse();
  const tracked = reversed.map((entry, idx) => ({
    id: idx,
    date: entry.date,
    tags: entry.tags || null,
    description: entry.description,
    implemented: false,
  }));
  // Reverse back to newest-first for display
  tracked.reverse();

  return renderChangelogMd(tracked, source);
}

function renderChangelogMd(tracked, source) {
  let md = '# WhatsApp Business Platform API — Changelog Tracker\n\n';
  md += `> Source: ${CHANGELOG_URL}\n`;
  md += `> Updated: ${new Date().toISOString()}\n`;
  md += `> Mode: ${source}\n\n`;

  let currentDate = null;
  let totalItems = 0;
  let checkedItems = 0;

  for (const entry of tracked) {
    if (entry.date !== currentDate) {
      currentDate = entry.date;
      md += `\n## ${currentDate}\n\n`;
    }

    const checkbox = entry.implemented ? '[x]' : '[ ]';
    const tagsStr = entry.tags ? `[${entry.tags}] ` : '';
    const desc = (entry.description || '').length > 500
      ? entry.description.substring(0, 500) + '...'
      : entry.description;
    const descOneLine = desc.replace(/\n/g, ' ');

    md += `- ${checkbox} **#${entry.id}** ${tagsStr}${descOneLine}\n`;
    totalItems++;
    if (entry.implemented) checkedItems++;
  }

  const pct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  md += `\n---\n\n**Progress: ${checkedItems}/${totalItems} (${pct}%)**\n`;

  writeFileSync(CHANGELOG_MD, md);
  return { totalItems, checkedItems, pct };
}

// ── 4. Display ──

function showTracker(keyword) {
  if (!existsSync(CHANGELOG_MD)) {
    console.error('No CHANGELOG.md found. Run crawl first.');
    process.exit(1);
  }

  let content = readFileSync(CHANGELOG_MD, 'utf-8');

  if (keyword) {
    const lower = keyword.toLowerCase();
    const lines = content.split('\n');
    const filtered = [];
    let currentHeading = '';

    for (const line of lines) {
      if (line.startsWith('# ') || line.startsWith('> ')) { filtered.push(line); continue; }
      if (line.startsWith('## ')) { currentHeading = line; continue; }
      if (line.startsWith('- [')) {
        if (line.toLowerCase().includes(lower) || currentHeading.toLowerCase().includes(lower)) {
          if (currentHeading && !filtered.includes(currentHeading)) {
            filtered.push('', currentHeading, '');
          }
          filtered.push(line);
        }
        continue;
      }
      if (line.startsWith('---') || line.startsWith('**Progress')) continue;
    }

    const total = filtered.filter((l) => l.startsWith('- [')).length;
    const done = filtered.filter((l) => l.startsWith('- [x]')).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    filtered.push('', '---', '', `**Progress: ${done}/${total} (${pct}%)** (filtered by: "${keyword}")`);
    content = filtered.join('\n');
  }

  console.log(content);
}

// ── 5. Show new items as JSON (for CI) ──

function showNewItems() {
  if (!existsSync(CHANGELOG_MD)) {
    console.log('[]');
    return;
  }

  const content = readFileSync(CHANGELOG_MD, 'utf-8');
  const items = [];

  for (const line of content.split('\n')) {
    const match = line.match(/^- \[ \] \*\*#(\d+)\*\* (?:\[(.+?)\] )?(.+)$/);
    if (match) {
      items.push({ id: parseInt(match[1], 10), tags: match[2] || null, description: match[3] });
    }
  }

  console.log(JSON.stringify(items, null, 2));
}

// ── 6. Mark/unmark ──

function markItem(target, value) {
  if (!existsSync(CHANGELOG_MD)) {
    console.error('No CHANGELOG.md found. Run crawl first.');
    process.exit(1);
  }

  const ids = target.split(',').map((s) => parseInt(s.trim(), 10));
  let content = readFileSync(CHANGELOG_MD, 'utf-8');

  for (const id of ids) {
    const pattern = new RegExp(`^- \\[[ x]\\] \\*\\*#${id}\\*\\*`, 'm');
    if (!pattern.test(content)) {
      console.error(`Entry #${id} not found.`);
      continue;
    }

    if (value) {
      content = content.replace(
        new RegExp(`^(- )\\[ \\]( \\*\\*#${id}\\*\\*.+)$`, 'm'),
        '$1[x]$2'
      );
    } else {
      content = content.replace(
        new RegExp(`^(- )\\[x\\]( \\*\\*#${id}\\*\\*.+)$`, 'm'),
        '$1[ ]$2'
      );
    }

    const descMatch = content.match(new RegExp(`\\*\\*#${id}\\*\\* (?:\\[.+?\\] )?(.{0,80})`));
    console.log(`${value ? 'Marked' : 'Unmarked'}: #${id} ${descMatch?.[1] || ''}...`);
  }

  // Recalculate progress
  const total = (content.match(/^- \[[ x]\]/gm) || []).length;
  const done = (content.match(/^- \[x\]/gm) || []).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  content = content.replace(/\*\*Progress: .+\*\*/, `**Progress: ${done}/${total} (${pct}%)**`);

  writeFileSync(CHANGELOG_MD, content);
}

// ── Main ──

async function main() {
  if (markTarget) { markItem(markTarget, true); return; }
  if (unmarkTarget) { markItem(unmarkTarget, false); return; }
  if (showOnly) { showTracker(filterKeyword); return; }
  if (newOnly) { showNewItems(); return; }

  let entries;
  let source;

  if (fullCrawl) {
    entries = await fullPlaywrightCrawl();
    source = 'playwright (full)';
  } else {
    entries = await fetchRSS();
    source = 'rss (recent)';
  }

  console.log(`Parsed ${entries.length} entries`);
  const stats = writeChangelogMd(entries, source);
  console.log(`CHANGELOG.md saved (${stats.totalItems} entries, ${stats.checkedItems} done, ${stats.pct}%)`);

  console.log('\n' + '='.repeat(70));
  showTracker(filterKeyword);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
