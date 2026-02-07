---
"meta-cloud-api": major
---

# v2.0.0 - Complete Documentation Site & Production Examples

This major release introduces a comprehensive documentation website, production-ready examples, and improved project structure with pnpm workspace.

## 🚨 Breaking Changes

- **Workspace Migration**: Project now uses pnpm workspace for better monorepo management
- **Examples Structure**: `express-example` renamed to `express-simple` for clarity

## ✨ New Features

### 📚 Complete Documentation Site (37 pages)
- **Getting Started**: Installation, quick start, configuration guides
- **API Reference**: Complete documentation for all 17 API modules
- **Webhook Guides**: Express, Next.js, and custom webhook implementations
- **Framework Guides**: Express, Next.js App/Pages Router integration
- **Type Reference**: TypeScript types, enums, and interfaces
- Built with Astro + Starlight theme
- Full-text search with Pagefind
- Mobile responsive design

### 🏗️ Production-Ready Express Example
- Complete customer support bot with conversation flows
- PostgreSQL database with Prisma ORM
- Redis session management
- BullMQ background job processing
- Comprehensive error handling and logging
- Full test suite (unit, integration, e2e)
- Docker deployment ready
- 57 files, 4,500+ lines of production code

### 🔄 CI/CD Workflows
- Automated documentation deployment to Vercel
- Example validation on pull requests
- Type checking and build verification

### 📦 Improved Package Structure
- pnpm workspace for efficient dependency management
- Examples use `workspace:*` protocol for local SDK linking
- Shared tooling configuration across packages

## 🎯 Documentation

Visit the new documentation site at https://meta-cloud-api.xyz

## 📝 Examples

- `express-simple`: Basic Express.js integration
- `express-production`: Production-ready example with full features
- `nextjs-app-router-example`: Next.js 15 App Router
- `nextjs-page-router-example`: Next.js Pages Router

## 🙏 Credits

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
