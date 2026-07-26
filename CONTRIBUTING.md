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

For the simplest safe push, run `pnpm push:safe`. It pushes the current branch, configures its
upstream when needed, and lets the Husky pre-push hook run the change-aware verification gate.

## Local verification

- `pnpm check` runs formatting, linting, type checking, unit and component tests, the production
  build, and bundle budgets.
- `pnpm verify:staged` formats and lints only staged supported files.
- `pnpm verify:changed` compares the branch with `origin/main` and verifies only changed files,
  Fallow findings, and Nx affected project targets with at most two parallel tasks. Shared
  configuration safely escalates to `pnpm check`.
- `pnpm nx show project map` displays the computed project targets and their cache configuration.
- `pnpm nx graph` visualizes project boundaries; `pnpm nx affected -t <targets>` uses the same graph
  as local and CI verification.
- `pnpm verify:full` explicitly runs the complete local quality and browser suite.
- `pnpm exec playwright install chromium` installs the local E2E browser once.
- `pnpm test:e2e` builds the application, starts the production preview, and runs Playwright.
- `pnpm test:lighthouse` builds the application and enforces performance, accessibility, SEO, and
  best-practice score thresholds.
- `pnpm container:build` packages the production build as `swearing-map:local` (Docker required).
- `pnpm container:smoke` starts that image temporarily and verifies its health endpoint, browser
  security headers, and cache policies on port 18080.
- `pnpm api:client:generate` refreshes the committed OpenAPI contract and typed Fetch client.
- `pnpm api:client:check` verifies generated API artifacts without changing the working tree.
- `pnpm db:generate` refreshes the committed Prisma Client after a schema change.
- `pnpm db:check` verifies Prisma Client generation without modifying the working tree.
- `pnpm test:database` uses an isolated PostGIS container to apply migrations, seed data, check
  schema drift, run integration tests, and clean up.
- `pnpm container:api:build` and `pnpm container:api:smoke` verify the non-root NestJS runtime.
- CI runs the same Playwright suite after the regular quality gate.
- CI runs Lighthouse against the same production build and blocks regressions below the declared
  thresholds.
- CI builds and smoke-tests the exact production runtime after the browser quality gates pass.

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

## Database changes

1. Start the development database with `pnpm db:up`.
2. Change `apps/api/prisma/schema.prisma`.
3. Create a reviewed migration with `pnpm db:migrate:dev -- --name <change-name>`.
4. Add database invariants that Prisma cannot express as reviewed SQL in that migration.
5. Run `pnpm db:generate`, `pnpm db:check`, and `pnpm test:database`.
6. Commit the schema, migration, seed changes, and generated client together.

Never use `prisma db push` for shared environments. Never edit an already deployed migration;
create a forward-fix migration instead. Production migration execution belongs to the release
phase and must use `prisma migrate deploy`.
