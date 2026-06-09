#!/usr/bin/env node
/**
 * crawl-changelog.mjs — Track Meta WhatsApp Business Platform Changelog
 * and maintain implementation status in CLOUD_API_CHANGELOG.md.
 *
 * Usage:
 *   node crawl-changelog.mjs                    # Fetch RSS and merge new entries
 *   node crawl-changelog.mjs --show             # Show current checklist
 *   node crawl-changelog.mjs --show --filter X  # Filter by keyword
 *   node crawl-changelog.mjs --mark "3"         # Mark item #3 as done
 *   node crawl-changelog.mjs --mark "3,4,5"     # Mark multiple items
 *   node crawl-changelog.mjs --unmark "3"       # Unmark item
 *   node crawl-changelog.mjs --new-only         # Show only new (unchecked) items as JSON
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SCRIPTS_DIR = resolve(import.meta.dirname);
const PROJECT_ROOT = resolve(SCRIPTS_DIR, '..');
const CHANGELOG_MD = join(PROJECT_ROOT, 'CLOUD_API_CHANGELOG.md');
const RSS_URL =
  'https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog/rss/';
const CHANGELOG_URL =
  'https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog';

// ── CLI args ──
const args = process.argv.slice(2);
const showOnly = args.includes('--show');
const newOnly = args.includes('--new-only');
const markIdx = args.indexOf('--mark');
const unmarkIdx = args.indexOf('--unmark');
const filterIdx = args.indexOf('--filter');
const markTarget = markIdx !== -1 ? args[markIdx + 1] : null;
const unmarkTarget = unmarkIdx !== -1 ? args[unmarkIdx + 1] : null;
const filterKeyword = filterIdx !== -1 ? args[filterIdx + 1] : null;

// ── 1. RSS fetch ──

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

    if (!title || !description) continue;

    entries.push({ date: title, description: description.trim() });
  }

  return entries;
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').trim() : null;
}

// ── 2. CHANGELOG.md management ──

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

function parseDate(dateStr) {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function writeChangelogMd(newEntries) {
  const { entries: existing, maxId } = parseChangelogMdFull();

  // Find the newest date in existing entries
  let newestExisting = null;
  for (const e of existing) {
    const d = parseDate(e.date);
    if (d && (!newestExisting || d > newestExisting)) newestExisting = d;
  }

  // Filter to entries strictly newer than the newest existing date
  const brandNew = newestExisting
    ? newEntries.filter((e) => {
        const d = parseDate(e.date);
        return d && d > newestExisting;
      })
    : [];

  if (brandNew.length === 0 && existing.length > 0) {
    console.log('No new entries to add.');
    const total = existing.length;
    const done = existing.filter((e) => e.implemented).length;
    return { totalItems: total, checkedItems: done, pct: Math.round((done / total) * 100) };
  }

  // Assign new IDs starting after the current max
  let nextId = maxId + 1;
  // Sort new entries oldest-first for stable ID assignment
  brandNew.sort((a, b) => parseDate(a.date) - parseDate(b.date));
  const newTracked = brandNew.map((entry) => ({
    id: nextId++,
    date: entry.date,
    tags: entry.tags || null,
    description: entry.description,
    implemented: false,
  }));

  // Merge: new entries (newest-first) + existing entries
  newTracked.reverse();
  const all = [...newTracked, ...existing];

  return renderChangelogMd(all);
}

function renderChangelogMd(tracked) {
  let md = '# WhatsApp Business Platform API — Changelog Tracker\n\n';
  md += `> Source: ${CHANGELOG_URL}\n`;
  md += `> Updated: ${new Date().toISOString()}\n\n`;

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

// ── 3. Display ──

function showTracker(keyword) {
  if (!existsSync(CHANGELOG_MD)) {
    console.error('No CLOUD_API_CHANGELOG.md found. Run crawl first.');
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

// ── 4. Show new items as JSON (for CI) ──

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

// ── 5. Mark/unmark ──

function markItem(target, value) {
  if (!existsSync(CHANGELOG_MD)) {
    console.error('No CLOUD_API_CHANGELOG.md found. Run crawl first.');
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

  const entries = await fetchRSS();
  console.log(`Parsed ${entries.length} entries`);
  const stats = writeChangelogMd(entries);
  console.log(`CHANGELOG.md saved (${stats.totalItems} entries, ${stats.checkedItems} done, ${stats.pct}%)`);

  console.log('\n' + '='.repeat(70));
  showTracker(filterKeyword);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
