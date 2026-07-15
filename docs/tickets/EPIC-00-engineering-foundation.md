# EPIC-00: Engineering foundation

- Status: Ready for review
- Branch: `codex/epic-00-engineering-foundation`

## Outcome

Create a reproducible, reviewable development baseline before product migration begins.

## Business value

Developers can make changes with fast feedback, consistent tooling, automated quality gates,
and traceability from a ticket through a pull request to deployment.

## Scope

- Record target architecture and package-management decisions.
- Define contribution, ticket, review, and Definition of Done rules.
- Pin Node.js and pnpm and keep one lockfile.
- Add formatting, linting, type checking, and unit testing.
- Run the same checks locally and in pull-request CI.

## Out of scope

- Next.js/NestJS migration.
- Product redesign.
- Database and cloud infrastructure.
- AdSense and consent implementation changes.

## Acceptance criteria

- Given a clean checkout, when `pnpm install --frozen-lockfile` runs, dependencies install
  without changing the lockfile.
- Given a contributor opens a pull request, when CI runs, formatting, lint, type checking,
  tests, and production build are required checks.
- Given a contributor starts work, when they read `CONTRIBUTING.md`, they can follow the
  ticket, branch, commit, and review workflow without undocumented steps.
- Given an architectural decision is questioned, when the ADR directory is reviewed, the
  accepted context and consequences are recorded.

## Definition of Done

- Acceptance criteria are automated where possible.
- New configuration is documented and reviewed.
- `pnpm check` passes locally.
- Production build remains functional.
- No unrelated product behavior is changed.

## Risks and rollback

- Tool versions may conflict with the legacy Vite stack. Pin compatible versions and revert
  the tooling commit if the build cannot remain green.
- CI is additive and can be disabled independently without affecting the runtime application.

## Verification evidence

- `pnpm install --frozen-lockfile`: passed
- pnpm 11 lockfile supply-chain policy: passed
- `pnpm check`: passed
- Unit tests: 2 passed
- `pnpm audit`: no known vulnerabilities
- Production build: passed with the existing large-bundle warning recorded for a follow-up ticket
