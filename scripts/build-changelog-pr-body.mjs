#!/usr/bin/env node
// Build the GitHub pull request body for newly detected WhatsApp changelog items.

import { readFileSync, writeFileSync } from 'node:fs';

const INPUT = process.env.CHANGELOG_NEW_ITEMS_FILE || '/tmp/new-changelog-items.json';
const OUTPUT = process.env.CHANGELOG_PR_BODY_FILE || '/tmp/pr-body.md';
const CHANGELOG_URL = 'https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog/';

const data = JSON.parse(readFileSync(INPUT, 'utf-8'));
const items = data.items || [];
const count = items.length;
const entryLabel = count === 1 ? 'entry' : 'entries';

const escapeCell = (value) => String(value || '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

const rows = items.map((item) => {
  const source = item.link ? `[Open](${item.link})` : `[Open](${CHANGELOG_URL})`;

  return `| #${item.id} | ${escapeCell(item.date)} | ${escapeCell(item.desc)} | ${source} |`;
});

const body = [
  '## WhatsApp Business Platform Changelog',
  '',
  `Meta published **${count}** new changelog ${entryLabel}. Review the entries below and update the SDK if any API behavior, endpoint, payload, or webhook contract changed.`,
  '',
  '### Sources',
  '',
  `- [Official changelog](${CHANGELOG_URL})`,
  `- [RSS feed](${data.source})`,
  '',
  '### New Entries',
  '',
  '| ID | Date | Summary | Source |',
  '| --- | --- | --- | --- |',
  ...rows,
  '',
].join('\n');

writeFileSync(OUTPUT, body);
