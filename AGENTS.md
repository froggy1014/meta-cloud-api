# Repository Guidelines

## Project Overview

WhatsApp TypeScript SDK. Published npm package providing type-safe WhatsApp Business Platform integration.

## Project Structure & Module Organization

- `src/api/`: WhatsApp API classes and types, organized per feature (e.g., `src/api/messages/MessageApi.ts`).
- `src/core/`: Main SDK class and webhook frameworks.
- `src/utils/`: Shared helpers, HTTP requester, error mapping, and small utilities.
- `src/types/`: Shared enums and public types.
- `docs/`: API usage examples; start with `docs/README.md`.
- `examples/`: Framework demos (Express, Next.js).
- `dist/`: Build output (generated, do not edit).

## Architecture

### Main Entry Point

- `src/core/whatsapp/WhatsApp.ts`: Primary SDK class that composes all API domain classes (messages, media, template, flow, phone, profile, etc.).

### API Modules (`src/api/`)

Each API domain follows a consistent pattern:

- `{Name}Api.ts`: Main class extending BaseAPI with methods for that domain.
- `types/`: TypeScript interfaces for request/response payloads.
- `__test__/unit.test.ts`: Colocated unit tests.

Key domains: messages, media, template, flow, phone, profile, calling, commerce, payments, groups, waba, qrCode, registration, twoStepVerification, encryption.

### Webhook System (`src/core/webhook/`)

- `WebhookProcessor.ts`: Framework-agnostic webhook handling.
- `frameworks/`: Express.js and Next.js adapters.
- `types/`: Webhook event type definitions.

### Shared Types (`src/types/`)

- `enums.ts`: All SDK enums (MessageTypesEnum, TemplateStatusEnum, etc.).
- `base.ts`: BaseAPI class definition.
- Request/response types shared across modules.

### Package Exports

- `meta-cloud-api`: Main SDK (`WhatsApp` class).
- `meta-cloud-api/types`: Type definitions only.
- `meta-cloud-api/enums`: Enums only.
- `meta-cloud-api/utils`: Utilities only.

## Build, Test, and Development Commands

- `pnpm dev`: Run `tsdown` in watch mode for local iteration.
- `pnpm build`: Clean build with `tsdown --clean`.
- `pnpm test`: Run unit tests with Vitest.
- `pnpm test:watch`: Watch mode for tests.
- `pnpm lint`: Biome linting for the repo.
- `pnpm format`: Biome formatting (auto-fix) for the repo.
- `pnpm typecheck`: TypeScript type checking without emit.
- `pnpm vitest run src/api/messages/__test__/unit.test.ts`: Run a single test file.

## WhatsApp Business Platform API References

Use the vendored OpenAPI snapshot first when updating `src/api` endpoints or types:

- Local OpenAPI snapshot: `docs/reference/business-messaging-api_v23.0.yaml`
- Snapshot notes: `docs/reference/README.md`

Then cross-check the relevant official docs:

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

## Coding Style & Naming Conventions

- TypeScript, ESM modules, 4-space indentation, single quotes, semicolons.
- Enforced by Biome (linting and formatting).
- TypeScript strict mode is expected.
- Path aliases: `@core/*`, `@api/*`, `@shared/*`.
- API classes use PascalCase (`MessageApi.ts`), folders are lower-case (`src/api/messages`).
- Keep request payloads as plain objects (avoid functional-style builders).
- API files keep a top-level doc link comment: `// Docs: <url>`.

## Testing Guidelines

- Test framework: Vitest.
- Unit tests live alongside APIs: `src/api/<name>/__test__/unit.test.ts`.
- Focus tests on endpoint paths, query params, and payloads.
- Tests use Vitest mocks such as `vi.mock` and `vi.fn`.

## Commit & Pull Request Guidelines

- Use Conventional Commit prefixes (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
- Keep commits small and scoped to a single change.
- PRs should describe behavior changes and list commands run (e.g., `pnpm test`).

## Security & Configuration Tips

- Never commit access tokens or secrets.
- Use env vars for credentials (see `README.md` and `.env.sample`).
- Common env vars: `CLOUD_API_ACCESS_TOKEN`, `WA_PHONE_NUMBER_ID`, `WA_BUSINESS_ACCOUNT_ID`.
- Runtime requirements: Node.js >= 18, pnpm >= 10.

## Skill Routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:

- Product ideas/brainstorming: invoke `/office-hours`.
- Strategy/scope: invoke `/plan-ceo-review`.
- Architecture: invoke `/plan-eng-review`.
- Design system/plan review: invoke `/design-consultation` or `/plan-design-review`.
- Full review pipeline: invoke `/autoplan`.
- Bugs/errors: invoke `/investigate`.
- QA/testing site behavior: invoke `/qa` or `/qa-only`.
- Code review/diff check: invoke `/review`.
- Visual polish: invoke `/design-review`.
- Ship/deploy/PR: invoke `/ship` or `/land-and-deploy`.
- Save progress: invoke `/context-save`.
- Resume context: invoke `/context-restore`.
