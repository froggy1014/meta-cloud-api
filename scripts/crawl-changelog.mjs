#!/usr/bin/env node
/**
 * crawl-changelog.mjs — Fetch Meta WhatsApp Business Platform Changelog
 * via RSS and merge new entries into CLOUD_API_CHANGELOG.md.
 *
 * Usage: node scripts/crawl-changelog.mjs
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

// ── RSS fetch ──

async function fetchRSS() {
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

// ── Changelog management ──

function parseChangelogMd() {
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

function mergeNewEntries(newEntries) {
  const { entries: existing, maxId } = parseChangelogMd();

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
    return { added: 0, total: existing.length };
  }

  // Assign new IDs starting after the current max
  let nextId = maxId + 1;
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

  writeChangelog(all);
  return { added: brandNew.length, total: all.length };
}

function writeChangelog(tracked) {
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
}

// ── Main ──

const entries = await fetchRSS();
console.log(`Fetched ${entries.length} RSS entries`);
const { added, total } = mergeNewEntries(entries);
console.log(`Added ${added} new entries (${total} total)`);
