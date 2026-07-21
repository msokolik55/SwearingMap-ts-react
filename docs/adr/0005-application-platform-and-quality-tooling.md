# ADR-0005: Application platform and quality tooling

- Status: Accepted
- Date: 2026-07-21

## Context

ADR-0001 selected the target framework architecture but did not choose the ORM, design system,
local quality-gate strategy, localization foundation, or PWA implementation. These choices affect
module boundaries, developer workflow, cache lifecycle, and every product feature in the roadmap.

## Decision

- Use Prisma ORM, Prisma Client, and Prisma Migrate with PostgreSQL. Keep PostGIS-specific access in
  a dedicated repository and use reviewed parameterized SQL only where Prisma cannot model the
  required spatial type or operation.
- Use Tailwind CSS with semantic design tokens and shadcn/ui components owned in the repository.
- Use i18next with react-i18next. Ship English first and keep UI locale independent from the
  selected content/quiz language.
- Use Serwist for the Next.js service worker, explicit update lifecycle, offline fallback, and PWA
  caching policy.
- Use Fallow as a regression-oriented codebase-quality gate for local, agent, CI, and release
  workflows.
- Use Husky only as a fast local feedback layer. CI repeats all required checks and remains the
  trusted merge and release boundary.
- Scope local checks to staged files, related tests, and Nx affected projects. Expand to the full
  workspace for shared configuration changes or when impact cannot be determined safely, and run
  full verification on `main`, release, and scheduled pipelines.
- Add Storybook and responsive/accessibility browser checks to prevent design-system drift.

## Consequences

- Prisma provides market-relevant type-safe persistence and migration tooling, while spatial SQL
  remains an explicit exception with tests and ownership.
- shadcn/ui source is customizable and reviewable, but the team owns upgrades and accessibility of
  modified components.
- Translation keys, direction-aware primitives, and locale/content-language separation add initial
  structure but avoid expensive retrofitting.
- Service-worker releases require dedicated multi-version E2E tests and careful cache invalidation.
- Fallow and hooks add feedback time; staged and affected scopes keep common operations bounded.
- Change-aware execution saves local time and memory but makes affected-project configuration part
  of the trusted build system; scheduled full runs detect drift in those rules.
- Hooks can be skipped and therefore never replace protected-branch CI.

## References

- Prisma PostgreSQL extensions: https://www.prisma.io/docs/orm/prisma-schema/postgresql-extensions
- Fallow audit: https://docs.fallow.tools/cli/audit
- Husky guide: https://typicode.github.io/husky/get-started.html
- Serwist for Next.js: https://serwist.pages.dev/docs/next
- Tailwind for Next.js: https://tailwindcss.com/docs/installation/framework-guides/nextjs
- shadcn/ui installation: https://ui.shadcn.com/docs/installation
- react-i18next: https://react.i18next.com/latest
