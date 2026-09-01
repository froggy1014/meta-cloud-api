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

// RSS descriptions arrive HTML-escaped (e.g. `&#x2014;` for an em dash).
const decodeEntities = (text) =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(+dec))
    .replace(/&(lt|gt|quot|apos|nbsp);/g, (_, name) => ({ lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[name])
    .replace(/&amp;/g, '&');

const tag = (src, name) => src.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').trim();
const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
  .map((m) => ({
    date: tag(m[1], 'title'),
    desc: tag(m[1], 'description')?.trim(),
    link: tag(m[1], 'link'),
  }))
  .filter((e) => e.date && e.desc)
  .map((e) => ({ ...e, desc: decodeEntities(e.desc) }));

console.log(`Fetched ${items.length} RSS entries`);

// Read existing changelog
const content = existsSync(FILE) ? readFileSync(FILE, 'utf-8') : '';
const idMatches = [...content.matchAll(/\*\*#(\d+)\*\*/g)];
const maxId = idMatches.length > 0 ? Math.max(...idMatches.map((m) => +m[1])) : -1;

// Truncate the same way entry lines are written, so dedupe compares like with like.
const truncate = (desc) => (desc.length > 500 ? desc.slice(0, 500) + '...' : desc);
const normalize = (desc) => decodeEntities(truncate(desc)).replace(/\s+/g, ' ').trim().toLowerCase();

// Dedupe against the descriptions already recorded, not against the newest date.
// The RSS feed is a rolling window, so a back-dated entry can surface after a newer
// one was already merged; a date-only filter would drop it permanently.
const recorded = new Set(
  [...content.matchAll(/^- \[[ x]\] \*\*#\d+\*\* (.+)$/gm)].map((m) => normalize(m[1])),
);

const newItems = items.filter((e) => !recorded.has(normalize(e.desc)));
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

// Merge new entries into the document, newest date first. Entries whose date section
// already exists are added to it; back-dated entries get a section at the right spot.
const groups = [];
for (const { date, line } of newLines) {
  const group = groups.find((g) => g.date === date);
  if (group) group.lines.push(line);
  else groups.push({ date, time: new Date(date).getTime(), lines: [line] });
}

const headings = (src) =>
  [...src.matchAll(/^## (.+)$/gm)].map((m) => ({
    date: m[1].trim(),
    time: new Date(m[1].trim()).getTime(),
    index: m.index,
    end: m.index + m[0].length,
  }));

// Offsets are recomputed from the live string on every insert, so order does not matter.
let updated = content;
for (const group of groups) {
  const existing = headings(updated);
  const same = existing.find((h) => h.date === group.date);

  if (same) {
    // Add to the top of the existing date section, just below its heading.
    const at = same.end + (updated.slice(same.end).match(/^\n+/)?.[0].length ?? 0);
    updated = updated.slice(0, at) + group.lines.join('\n') + '\n' + updated.slice(at);
    continue;
  }

  // Sections run newest first, so the first older heading is the insertion point.
  const older = existing.find((h) => h.time < group.time);
  if (older) {
    updated =
      updated.slice(0, older.index) + `## ${group.date}\n\n${group.lines.join('\n')}\n\n` + updated.slice(older.index);
  } else {
    const headerEnd = updated.indexOf('\n## ');
    const block = `\n## ${group.date}\n\n${group.lines.join('\n')}\n`;
    updated = headerEnd !== -1 ? updated.slice(0, headerEnd) + block + updated.slice(headerEnd) : updated + block;
  }
}

// Update progress line
const total = (updated.match(/^- \[[ x]\]/gm) || []).length;
const done = (updated.match(/^- \[x\]/gm) || []).length;
const pct = total > 0 ? Math.round((done / total) * 100) : 0;
const final = updated
  .replace(/\*\*Progress: .+\*\*/, `**Progress: ${done}/${total} (${pct}%)**`)
  .replace(/^> Updated: .+$/m, `> Updated: ${new Date().toISOString()}`);

writeFileSync(FILE, final);
console.log(`Added ${newItems.length} new entries (${total} total)`);
