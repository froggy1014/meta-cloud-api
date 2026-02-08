# Repository Guidelines

## Project Structure & Module Organization

- `src/api/`: WhatsApp API classes and types, organized per feature (e.g., `src/api/messages/MessageApi.ts`).
- `src/core/`: Main SDK class and webhook frameworks.
- `src/utils/`: Shared helpers, HTTP requester, error mapping, and small utilities.
- `src/types/`: Shared enums and public types.
- `docs/`: API usage examples; start with `docs/README.md`.
- `examples/`: Framework demos (Express, Next.js).
- `dist/`: Build output (generated, do not edit).

## Build, Test, and Development Commands

- `pnpm dev`: Run `tsdown` in watch mode for local iteration.
- `pnpm build`: Clean build with `tsdown --clean`.
- `pnpm test`: Run unit tests with Vitest.
- `pnpm test:watch`: Watch mode for tests.
- `pnpm lint`: Biome linting for the repo.
- `pnpm format`: Biome formatting (auto-fix) for the repo.
- `pnpm typecheck`: TypeScript type checking without emit.

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

## Coding Style & Naming Conventions

- TypeScript, ESM modules, 4-space indentation, single quotes, semicolons.
- Enforced by Biome (linting and formatting).
- API classes use PascalCase (`MessageApi.ts`), folders are lower-case (`src/api/messages`).
- Keep request payloads as plain objects (avoid functional-style builders).
- API files keep a top-level doc link comment: `// Docs: <url>`.

## Testing Guidelines

- Test framework: Vitest.
- Unit tests live alongside APIs: `src/api/<name>/__test__/unit.test.ts`.
- Focus tests on endpoint paths, query params, and payloads.

## Commit & Pull Request Guidelines

- Use Conventional Commit prefixes (`feat:`, `fix:`, `chore:`, `docs:`).
- Keep commits small and scoped to a single change.
- PRs should describe behavior changes and list commands run (e.g., `pnpm test`).

## Security & Configuration Tips

- Never commit access tokens or secrets.
- Use env vars for credentials (see `README.md` and example `.env` files).
- Runtime requirements: Node.js >= 18, pnpm >= 10.
