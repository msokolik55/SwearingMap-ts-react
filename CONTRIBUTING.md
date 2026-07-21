# Contributing

## Prerequisites

- Node.js version from `.nvmrc`
- Corepack enabled
- pnpm version declared in `package.json`

## Workflow

1. Start from an approved ticket with testable acceptance criteria.
2. Create a short-lived branch such as `feat/SM-123-country-search` or
   `fix/SM-456-popup-position`.
3. Keep commits focused and use Conventional Commits.
4. Run `pnpm check` before opening a pull request.
5. Complete the pull-request template and link the ticket.
6. Address review conversations and keep all required checks green.
7. Squash merge after approval. Do not push directly to `main`.

## Local verification

- `pnpm check` runs formatting, linting, type checking, unit and component tests, the production
  build, and bundle budgets.
- `pnpm exec playwright install chromium` installs the local E2E browser once.
- `pnpm test:e2e` builds the application, starts the production preview, and runs Playwright.
- CI runs the same Playwright suite after the regular quality gate.

## Commit examples

- `feat(map): add severity filter`
- `fix(data): reject invalid country geometry`
- `test(api): cover submission moderation`
- `docs(adr): record tile provider decision`

## Definition of Done

- Acceptance criteria are met.
- Relevant unit, integration, and end-to-end tests are added or updated.
- Formatting, lint, type checking, tests, and build pass.
- Security, privacy, accessibility, performance, and observability impacts are considered.
- Documentation, migrations, feature flags, and rollback notes are updated when applicable.
- No unrelated refactor is included.

## Architecture decisions

Material decisions are recorded as ADRs in `docs/adr`. Accepted ADRs are immutable; a new ADR
supersedes an earlier decision and links back to it.
