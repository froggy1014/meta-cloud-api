# Contributing to Meta Cloud API

Thank you for your interest in contributing to Meta Cloud API! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Contributing to Meta Cloud API](#contributing-to-meta-cloud-api)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Getting Started](#getting-started)
    - [Development Setup](#development-setup)
    - [Project Structure](#project-structure)
  - [Development Workflow](#development-workflow)
    - [Branching Strategy](#branching-strategy)
    - [Commits](#commits)
    - [Pull Requests](#pull-requests)
  - [Coding Standards](#coding-standards)
    - [TypeScript Guidelines](#typescript-guidelines)
    - [Testing](#testing)
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

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/froggy1014/meta-cloud-api.git
   cd meta-cloud-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn
   # or 
   pnpm install
   ```

3. **Set up environment variables**

   Copy the `.env.example` file to `.env` and fill in the required values:

   ```bash
   cp .env.example .env
   ```

4. **Build the project**

   ```bash
   npm run build
   # or
   yarn build
   # or
   pnpm build
   ```

### Project Structure

The project is organized as follows:

```
packages/meta-cloud-api/
├── dist/           # Compiled output
├── examples/       # Example projects
├── src/            # Source code
│   ├── api/        # API modules organized by domain
│   ├── types/      # TypeScript type definitions
│   ├── utils/      # Utility functions
│   ├── webhook/    # Webhook handling
│   ├── index.ts    # Main entry point
│   └── whatsapp.ts # Main WhatsApp client
├── tests/          # Test files
└── ...
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
3. Run tests: `npm test`
4. Update documentation if needed
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

### Documentation

- Update the README and documentation for any user-facing changes
- Include JSDoc comments for all public APIs
- Document complex algorithms or design decisions with inline comments
- Update example projects if needed

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

Thank you for contributing to Meta Cloud API!
