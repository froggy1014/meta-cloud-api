---
name: changelog-tracker
description: >
  Crawl the Meta WhatsApp Business Platform API changelog and track SDK implementation
  status with checkboxes. Use this skill whenever:
  checking changelog, tracking changes, marking implementations, "show changelog",
  "what's implemented?", "changes", "progress", "checklist", "mark as done",
  "implemented", "changelog tracker", "API change tracking", identifying items
  to implement after a new API version release.
  When the user says "I implemented this" or "this is done" after SDK work, update the check status.
---

# Changelog Tracker

Crawls the Meta WhatsApp Business Platform API changelog via Playwright and
tracks SDK implementation status for each change item as checkboxes in `CHANGELOG.md`.

## Why This Skill Exists

Meta continuously updates its API and publishes changes in a date-based changelog.
This skill fetches all changelog entries and lets you track whether each one
has been reflected in the SDK. The state lives in `CHANGELOG.md` — a plain
markdown file with checkboxes, readable by humans and machines alike.

## Commands

```bash
# Crawl changelog and generate/update CHANGELOG.md (~30s)
node .claude/skills/changelog-tracker/crawl-changelog.mjs

# Show current checklist
node .claude/skills/changelog-tracker/crawl-changelog.mjs --show

# Filter by keyword (date, tag, content)
node .claude/skills/changelog-tracker/crawl-changelog.mjs --show --filter "Cloud API"
node .claude/skills/changelog-tracker/crawl-changelog.mjs --show --filter "2026"

# Mark item as done — use the ID number
node .claude/skills/changelog-tracker/crawl-changelog.mjs --mark "3"

# Mark multiple items at once
node .claude/skills/changelog-tracker/crawl-changelog.mjs --mark "3,4,5"

# Unmark item
node .claude/skills/changelog-tracker/crawl-changelog.mjs --unmark "3"
```

## Data Structure

`CLOUD_API_CHANGELOG.md` (in the project root) is the single source of truth. It's a standard markdown file:

```markdown
# WhatsApp Business Platform API — Changelog Tracker

> Source: https://developers.facebook.com/.../changelog
> Updated: 2026-06-09T...

## June 4, 2026

- [ ] **#0** [Business Management API] Clarified the Business phone numbers...
- [x] **#1** [Cloud API] Added new endpoint...

## June 3, 2026

- [ ] **#2** [Cloud API, Webhooks] Updated webhook payload...

---

**Progress: 1/3 (33%)**
```

The `#number` is the ID used for mark/unmark.

## Workflow

### 1. Crawl (first use or when checking for new changes)

```bash
node .claude/skills/changelog-tracker/crawl-changelog.mjs
```

Crawls the changelog page via Playwright and generates `CLOUD_API_CHANGELOG.md` at the project root.
Previously checked items are preserved if the description text matches.

### 2. View Checklist

```bash
node .claude/skills/changelog-tracker/crawl-changelog.mjs --show
```

Prints CLOUD_API_CHANGELOG.md to stdout. Since there are many items (~400+), filtering is recommended:

```bash
node .claude/skills/changelog-tracker/crawl-changelog.mjs --show --filter "Cloud API"
node .claude/skills/changelog-tracker/crawl-changelog.mjs --show --filter "2026"
```

### 3. Mark/Unmark Items

```bash
node .claude/skills/changelog-tracker/crawl-changelog.mjs --mark "5"       # Single
node .claude/skills/changelog-tracker/crawl-changelog.mjs --mark "5,6,7"   # Multiple
node .claude/skills/changelog-tracker/crawl-changelog.mjs --unmark "5"     # Unmark
```

### 4. Claude Usage Guide

**When asked to show the checklist:**
1. If `CLOUD_API_CHANGELOG.md` exists in the project root, read it and present as markdown
2. If not, suggest running the crawl command
3. The full list is very long — ask the user what scope they want or use `--filter`

**When asked to check items:**
1. Identify target item IDs from the user's request
2. Run the mark command with the IDs
3. For natural language like "mark all Cloud API items as done",
   read CLOUD_API_CHANGELOG.md to find matching IDs, then mark them

## File Structure

```
.claude/skills/changelog-tracker/
  SKILL.md                   # This skill definition
  crawl-changelog.mjs        # Crawler + tracker script
  .changelog-crawl.json      # Playwright crawl cache (gitignored)

# Project root:
  CLOUD_API_CHANGELOG.md     # Generated checklist (git tracked)
```

## Notes

- Playwright must be installed as a dev dependency
- Crawling hits Meta's servers — avoid running too frequently
- `.changelog-crawl.json` is gitignored; `CHANGELOG.md` is git-tracked
- Check state is preserved by matching the first 100 chars of description text
