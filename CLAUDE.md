# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript SDK wrapper for Meta's WhatsApp Cloud API. Published npm package providing type-safe WhatsApp Business Platform integration.

## Commands

```bash
pnpm dev          # Watch mode development
pnpm build        # Clean production build
pnpm test         # Run all tests
pnpm test:watch   # Watch mode tests
pnpm lint         # Biome linting
pnpm format       # Biome formatting (auto-fix)
pnpm typecheck    # TypeScript checking
```

To run a single test file:
```bash
pnpm vitest run src/api/messages/__test__/unit.test.ts
```

## Architecture

### Main Entry Point
`src/core/whatsapp/WhatsApp.ts` - Primary SDK class that composes all API domain classes (messages, media, template, flow, phone, profile, etc.).

### API Modules (`src/api/`)
Each API domain follows a consistent pattern:
- `{Name}Api.ts` - Main class extending BaseAPI with methods for that domain
- `types/` - TypeScript interfaces for request/response payloads
- `__test__/unit.test.ts` - Colocated unit tests

Key domains: messages, media, template, flow, phone, profile, calling, commerce, payments, groups, waba, qrCode, registration, twoStepVerification, encryption

### Webhook System (`src/core/webhook/`)
- `WebhookProcessor.ts` - Framework-agnostic webhook handling
- `frameworks/` - Express.js and Next.js adapters
- `types/` - Webhook event type definitions

### Shared Types (`src/types/`)
- `enums.ts` - All SDK enums (MessageTypesEnum, TemplateStatusEnum, etc.)
- `base.ts` - BaseAPI class definition
- Request/response types shared across modules

### Package Exports
```
meta-cloud-api         # Main SDK (WhatsApp class)
meta-cloud-api/types   # Type definitions only
meta-cloud-api/enums   # Enums only
meta-cloud-api/utils   # Utilities only
```

## WhatsApp Business Platform API References

Use these official docs when updating `src/api` endpoints or types:

- Overview: https://developers.facebook.com/documentation/business-messaging/whatsapp/overview/
- Messages: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/
- Media: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media/
- Templates: https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/
- Flows: https://developers.facebook.com/documentation/business-messaging/whatsapp/flows/
- Phone Numbers: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers/
- Registration: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/registration/
- Two-Step Verification: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/two-step-verification/
- Business Profiles: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-profiles/
- QR Codes: https://developers.facebook.com/documentation/business-messaging/whatsapp/qr-codes/
- WABA: https://developers.facebook.com/documentation/business-messaging/whatsapp/whatsapp-business-accounts/
- Block Users: https://developers.facebook.com/documentation/business-messaging/whatsapp/block-users/
- Encryption: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/whatsapp-business-encryption/
- Calling: https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference/
- Groups: https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference/
- Marketing Messages: https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/send-marketing-messages/
- Commerce Settings: https://developers.facebook.com/documentation/business-messaging/whatsapp/catalogs/sell-products-and-services/set-commerce-settings/
- Payments (India): https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/onboarding-apis/

## Code Conventions

- TypeScript with strict mode, ESM modules
- 4-space indentation, single quotes, semicolons
- Path aliases: `@core/*`, `@api/*`, `@shared/*`
- API files include top-level doc link: `// Docs: <url>`
- Request payloads as plain objects (not builders)
- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`

## Testing

Tests colocated at `src/api/<domain>/__test__/unit.test.ts`. Focus on endpoint paths, query params, and payloads. Uses Vitest with mocks (vi.mock, vi.fn()).

## Environment

Required: Node.js >= 18, pnpm >= 10. See `.env.example` for required variables (CLOUD_API_ACCESS_TOKEN, WA_PHONE_NUMBER_ID, WA_BUSINESS_ACCOUNT_ID).
