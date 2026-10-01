# Contributing to meta-cloud-api

Thank you for your interest in contributing to meta-cloud-api! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Contributing to meta-cloud-api](#contributing-to-meta-cloud-api)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Getting Started](#getting-started)
    - [Development Setup](#development-setup)
    - [Development Commands](#development-commands)
    - [Project Structure](#project-structure)
  - [Development Workflow](#development-workflow)
    - [Branching Strategy](#branching-strategy)
    - [Commits](#commits)
    - [Pull Requests](#pull-requests)
  - [Coding Standards](#coding-standards)
    - [TypeScript Guidelines](#typescript-guidelines)
    - [Testing](#testing)
    - [OpenAPI Contract Test](#openapi-contract-test)
    - [Documentation](#documentation)
  - [Bug Reports and Feature Requests](#bug-reports-and-feature-requests)
  - [Communication](#communication)

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Be respectful and inclusive
- Be patient and welcoming
- Be thoughtful
- Be collaborative
- Gracefully accept constructive criticism

## Getting Started

### Development Setup

You need Node.js 20.12+ and pnpm 10+. The repository is a pnpm workspace (SDK at the root, plus
`website/`, `examples/*` and `packages/*`).

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/froggy1014/meta-cloud-api.git
   cd meta-cloud-api
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables** (only needed to run the examples against the real API)

   ```bash
   cp .env.sample .env
   ```

4. **Build the project**

   ```bash
   pnpm build
   ```

### Development Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Rebuild with `tsdown` in watch mode |
| `pnpm build` | Clean build into `dist/` |
| `pnpm test` | Run all unit tests with Vitest (includes the OpenAPI contract test) |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm vitest run src/api/messages/__test__/unit.test.ts` | Run a single test file |
| `pnpm lint` | Biome lint and format check (CI requires 0 errors) |
| `pnpm format` | Biome with auto-fix |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm smoke:runtime` | Smoke-test the built `dist/` on the current runtime; run it with `bun` or `deno run --allow-read --allow-env scripts/runtime-smoke/run.mjs` for those runtimes |
| `pnpm smoke:workerd` | Smoke-test the built `dist/` inside Cloudflare's workerd (Miniflare), without Node.js compatibility flags |
| `pnpm docs:check-snippets` | Type-check the `typescript` code blocks of selected docs pages against `src/` |
| `pnpm --filter website dev` / `build` | Run or build the documentation site |
| `pnpm changeset` | Record a release note for a user-facing change |

The smoke scripts import from `dist/`, so run `pnpm build` first.

### Project Structure

```
meta-cloud-api/
├── src/
│   ├── api/                 # One folder per API domain (messages, media, template, flow, ...)
│   │   └── <name>/
│   │       ├── <Name>Api.ts      # Class extending BaseAPI
│   │       ├── types/            # Request/response types
│   │       └── __test__/unit.test.ts
│   ├── core/
│   │   ├── whatsapp/        # The WhatsApp class that composes every API
│   │   └── webhook/         # WebhookProcessor, framework adapters, webhook types
│   ├── types/               # Shared enums and public types
│   ├── utils/               # HTTP requester, errors, Flow encryption, helpers
│   └── __test__/            # Cross-cutting tests (exports, OpenAPI contract)
├── docs/reference/          # Vendored Meta OpenAPI snapshot
├── scripts/                 # Runtime smoke tests, docs snippet check, changelog crawler
├── website/                 # Documentation site (Astro Starlight)
├── examples/                # Express and Next.js example apps
└── packages/                # create-whatsapp-app and other published packages
```

## Development Workflow

### Branching Strategy

- `main` - Main development branch
- Feature branches should be created from `main` and named descriptively:
  - `feature/new-feature-name`
  - `fix/bug-description`
  - `docs/what-was-documented`

### Commits

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code changes that neither fix bugs nor add features
- `test:` - Adding or modifying tests
- `chore:` - Changes to build process or auxiliary tools

Examples:

```
feat: add support for template components
fix: correct HTTP method for marking messages as read
docs: update README with webhook examples
```

### Pull Requests

1. Create a new branch from `main`
2. Make your changes
3. Run `pnpm lint`, `pnpm typecheck` and `pnpm test`
4. Update documentation if needed, and add a changeset (`pnpm changeset`) for user-facing changes
5. Submit a pull request
6. Ensure the PR description clearly describes the problem and solution
7. Include the relevant issue number if applicable
8. Request a review from maintainers

## Coding Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Maintain strong typing (avoid `any` when possible)
- Follow the existing code style in the project
- Use interfaces for object shapes
- Properly document public APIs with JSDoc comments

### Testing

- Add tests for all new features and bug fixes
- Ensure all tests pass before submitting a PR
- Aim for high test coverage for critical paths
- Unit tests live next to the API they cover: `src/api/<name>/__test__/unit.test.ts`. Focus them on
  endpoint paths, query parameters and payloads, using Vitest mocks (`vi.mock`, `vi.fn`)

### OpenAPI Contract Test

`src/__test__/openapi-contract.test.ts` runs as part of `pnpm test`. It calls every public method of
every API class on `WhatsApp` with a recording requester and checks each `(HTTP method, path)` pair
against the vendored Meta OpenAPI snapshot (`docs/reference/business-messaging-api_v23.0.yaml`). A
typo'd edge, a wrong HTTP method or an undocumented endpoint fails the test. New methods are picked
up automatically.

When it fails on a method you added:

- **The endpoint is real but missing from the snapshot** (newer than v23, or documented elsewhere,
  like Payments India): add an entry to `SPEC_ALLOWLIST`. The key is `<METHOD> <normalized path>`
  exactly as the failure message prints it; the value says why it is allowlisted and where it is
  documented:

  ```ts
  'GET {PHONE_NUMBER_ID}/username': 'Business username API, added after v23 snapshot',
  ```

  Entries must stay accurate: if the SDK stops calling the endpoint or the snapshot gains it, the
  "no stale allowlist entries" test fails until the entry is removed.
- **The method throws for the default dummy arguments** (for example it validates its input): add
  an `ARG_OVERRIDES` entry keyed `<api>.<method>` that returns valid arguments.
- **The method is a helper that never sends a request**: add `<api>.<method>` to
  `NON_REQUEST_METHODS`.

Do not edit the YAML snapshot by hand; see `docs/reference/README.md` for how to refresh it.

### Documentation

- Update the README and documentation for any user-facing changes
- Include JSDoc comments for all public APIs
- Document complex algorithms or design decisions with inline comments
- Update example projects if needed
- Docs pages live in `website/src/content/docs`. The `typescript` blocks of pages listed in the
  `docs:check-snippets` script are compiled against `src/` in CI, so keep them self-contained
  (include the imports)

## Bug Reports and Feature Requests

Please use GitHub Issues to report bugs or request features:

1. Search for existing issues before creating a new one
2. Provide detailed reproduction steps for bugs
3. Include relevant information:
   - Package version
   - Node.js version
   - Environment details
   - Error messages and stack traces

For feature requests:

1. Clearly describe the problem you're trying to solve
2. Suggest a solution if you have one in mind
3. Indicate if you're willing to help implement it

## Communication

- GitHub Issues: For bug reports and feature discussions
- Pull Requests: For code review discussions

Thank you for contributing to meta-cloud-api!
