# PLAN-001: Target product roadmap

- Status: Done
- Priority: High
- Branch: `codex/plan-001-product-roadmap`
- Delivered by: [`101d256`](https://github.com/msokolik55/SwearingMap-ts-react/commit/101d256)

## Outcome

Convert the agreed product ideas into an ordered, dependency-aware delivery roadmap with explicit
quality gates, routes, domain capabilities, and implementation tickets.

## Scope

- Record the target developer workflow for Fallow, Husky, local checks, CI, and CD.
- Make local verification change-aware to minimize runtime and memory without weakening protected
  branch and release guarantees.
- Add Prisma, PWA lifecycle, notifications, design system, responsive design, and i18n work.
- Define the initial word-rating, submission, moderation, translation, and quiz use cases.
- List every initial user-facing and administration route required by those use cases.
- Separate UI locale from the language being learned or browsed.
- Identify unresolved product decisions without silently hard-coding assumptions.

## Acceptance criteria

- Every requested capability belongs to an epic with acceptance criteria and dependencies.
- The roadmap distinguishes local feedback, merge gates, and deployment gates.
- Local commands check staged files, related tests, and affected projects; full checks have explicit
  escalation rules and remain mandatory for main, releases, and scheduled verification.
- The proposed domain model supports adding languages and product features without schema rewrites.
- PWA updates do not require users to clear browser caches.
- Responsive and accessibility expectations are part of every future UI ticket's Definition of Done.

## Verification evidence

- Roadmap: `docs/roadmap/target-product-roadmap.md`.
- Target platform decision: ADR-0005.
- Delivery epics: DX-001, ARCH-001, UI-001, PWA-001, and PROD-001.
