#!/usr/bin/env node
// Fetch Meta Cloud API changelog via RSS and merge new entries into CLOUD_API_CHANGELOG.md.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const FILE = resolve(import.meta.dirname, '..', 'CLOUD_API_CHANGELOG.md');
const RSS = 'https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog/rss/';
const CHANGELOG_URL = 'https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog/';
const PR_BODY_FILE = process.env.CHANGELOG_PR_BODY_FILE;

const escapeCell = (value) => String(value || '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

const buildPrBody = (newLines) => {
  const count = newLines.length;
  const entryLabel = count === 1 ? 'entry' : 'entries';
  const rows = newLines.map((item) => {
    const source = item.link ? `[Open](${item.link})` : `[Open](${CHANGELOG_URL})`;

    return `| #${item.id} | ${escapeCell(item.date)} | ${escapeCell(item.desc)} | ${source} |`;
  });

  return [
    '## Cloud API Changelog',
    '',
    `Meta published **${count}** new changelog ${entryLabel}. Review the entries below and update the SDK if any API behavior, endpoint, payload, or webhook contract changed.`,
    '',
    '### Sources',
    '',
    `- [Official changelog](${CHANGELOG_URL})`,
    `- [RSS feed](${RSS})`,
    '',
    '### New Entries',
    '',
    '| ID | Date | Summary | Source |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n');
};

// Fetch and parse RSS
const res = await fetch(RSS);
if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
const xml = await res.text();

const tag = (src, name) => src.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').trim();
const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
  .map((m) => ({
    date: tag(m[1], 'title'),
    desc: tag(m[1], 'description')?.trim(),
    link: tag(m[1], 'link'),
  }))
  .filter((e) => e.date && e.desc);

console.log(`Fetched ${items.length} RSS entries`);

// Read existing changelog
const content = existsSync(FILE) ? readFileSync(FILE, 'utf-8') : '';
const idMatches = [...content.matchAll(/\*\*#(\d+)\*\*/g)];
const maxId = idMatches.length > 0 ? Math.max(...idMatches.map((m) => +m[1])) : -1;

// Find newest existing date
const dateMatches = [...content.matchAll(/^## (.+)$/gm)];
const newestDate = dateMatches.length > 0 ? Math.max(...dateMatches.map((m) => new Date(m[1]).getTime())) : 0;

// Filter to strictly newer entries
const newItems = items.filter((e) => new Date(e.date).getTime() > newestDate);
if (newItems.length === 0) {
  console.log('No new entries.');
  process.exit(0);
}

// Build new lines (oldest first for stable IDs, then reverse for display)
newItems.sort((a, b) => new Date(a.date) - new Date(b.date));
const newLines = newItems.map((e, i) => ({
  id: maxId + 1 + i,
  date: e.date,
  desc: e.desc,
  link: e.link,
  line: `- [ ] **#${maxId + 1 + i}** ${e.desc.length > 500 ? e.desc.slice(0, 500) + '...' : e.desc}`,
}));
newLines.reverse();

if (PR_BODY_FILE) {
  writeFileSync(PR_BODY_FILE, buildPrBody(newLines));
}

// Prepend new entries grouped by date
let insert = '';
let prevDate = null;
for (const { date, line } of newLines) {
  if (date !== prevDate) {
    insert += `\n## ${date}\n\n`;
    prevDate = date;
  }
  insert += line + '\n';
}

// Insert after header (before first ## or at end of header)
const headerEnd = content.indexOf('\n## ');
const updated = headerEnd !== -1
  ? content.slice(0, headerEnd) + insert + content.slice(headerEnd)
  : content + insert;

// Update progress line
const total = (updated.match(/^- \[[ x]\]/gm) || []).length;
const done = (updated.match(/^- \[x\]/gm) || []).length;
const pct = total > 0 ? Math.round((done / total) * 100) : 0;
const final = updated.replace(/\*\*Progress: .+\*\*/, `**Progress: ${done}/${total} (${pct}%)**`);

writeFileSync(FILE, final);
console.log(`Added ${newItems.length} new entries (${total} total)`);
