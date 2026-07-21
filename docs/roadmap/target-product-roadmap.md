# Target product roadmap

## Product direction

Build an extensible multilingual learning and reference platform around culturally contextual swear
words. The map remains a discovery surface, while indexable word, country, language, quiz, and
editorial pages create the reusable product model and SEO surface.

The target remains an Nx-managed pnpm monorepo with Next.js, NestJS, PostgreSQL/PostGIS, Prisma,
MapLibre, shared contracts, and automated delivery. A modular monolith is the default; services are
split only for measured scaling or ownership needs.

## Delivery principles

- Tickets define observable outcomes and acceptance criteria before implementation.
- Short-lived branches, Conventional Commits, reviewed pull requests, and protected `main` are
  mandatory.
- Local hooks provide fast feedback; CI is the authoritative merge gate and cannot be replaced by
  Husky.
- The same immutable image is promoted through environments; CD never rebuilds source for
  production.
- Schema changes use reviewed Prisma migrations and tested rollback or forward-fix procedures.
- Accessibility, responsive behavior, security, privacy, performance, observability, and i18n are
  acceptance criteria, not post-release cleanup.
- AI-assisted code must pass the same human review and automated evidence as human-written code.

## Ordered roadmap

### Phase 0: Close the current foundation

1. Create, review, and merge OPS-001 production-container PR.
2. Verify required GitHub checks and branch protection.
3. Change merged ticket states to `Done`, add PR/commit links, and remove obsolete branches.

### Phase 1: Developer-experience guardrails (`DX-001`)

1. Install Fallow and commit a reviewed configuration and initial baseline.
2. Run Fallow locally, in the AI-agent workflow, on pull requests, and before artifact publication.
3. Introduce Husky, lint-staged, and commit-message validation.
4. Provide `pnpm push:safe`, which detects the current branch, configures its upstream when needed,
   invokes `git push`, and lets the Husky pre-push gate approve or reject it.
5. Keep all local gates change-aware. Pre-commit formats and lints staged files only. Pre-push
   compares the branch with its merge base, runs Fallow on the diff, related tests, and Nx affected
   lint/typecheck/build targets only. It must handle added, modified, renamed, and deleted files.
6. Store machine-readable Fallow output as a CI artifact; publish SARIF or a sticky PR summary when
   repository permissions allow it.
7. Start with regression-only enforcement against a committed baseline, then ratchet thresholds as
   existing findings are removed. Do not mass-suppress findings.
8. Reserve the complete repository suite for merges to `main`, release candidates, scheduled drift
   checks, manual `verify:full`, or changes to shared build, dependency, CI, Nx, TypeScript, lint, or
   test configuration that can affect every project.

Planned command contract:

```text
pnpm verify:staged   -> lint-staged (Prettier + ESLint)
pnpm verify:changed  -> changed files + related tests + Nx affected targets
pnpm fallow:audit    -> changed-code audit with fail-on-regression
pnpm verify:push     -> verify:changed against the branch merge base
pnpm verify:ci       -> affected PR checks selected from the same change graph
pnpm verify:full     -> explicit complete repository verification
pnpm push:safe      -> safe cross-platform wrapper around git push; Husky runs verify:push
```

Hooks are bypassable developer conveniences, so protected-branch CI repeats their guarantees. CD
requires the CI result and adds container scanning before promotion. Change detection is an
optimization, not a trust boundary: a central configuration or dependency-graph change expands the
affected set to the whole workspace, and `main`, scheduled, and release pipelines run the full
suite. Local affected tasks use bounded parallelism to avoid exhausting developer memory.

### Phase 2: Application platform and persistence (`ARCH-001`)

1. Create the Nx monorepo and migrate the current map behind an incremental route boundary.
2. Add the Next.js App Router web application and NestJS modular-monolith API.
3. Add PostgreSQL/PostGIS locally and in integration tests.
4. Add Prisma Schema, Prisma Client, Prisma Migrate, deterministic seed data, and a database test
   fixture strategy.
5. Use Prisma repositories for normal relational access. Isolate PostGIS operations behind a
   geospatial repository with reviewed parameterized SQL where Prisma cannot represent a spatial
   operation natively.
6. Generate an OpenAPI client for the web application and enforce Nx module boundaries.
7. Add authentication and role-based authorization before accepting ratings or submissions.

Initial domain entities:

- `User`, `Role`, and `Session`;
- `Language` and `Country`;
- `SwearWord`, `Meaning`, `UsageExample`, and `Source`;
- `TranslationEquivalent` linking two words with optional confidence and explanatory notes;
- `IntensityRating` with one active rating per authenticated user and word;
- `Submission` and `ModerationDecision` with an audit trail;
- `QuizAttempt`, `QuizQuestion`, and answer results;
- `Notification`, `NotificationPreference`, and `PushSubscription`.

### Phase 3: Design system, navigation, responsive UI, and i18n (`UI-001`)

1. Add Tailwind CSS and shadcn/ui as the owned component foundation.
2. Define semantic design tokens for color, typography, spacing, elevation, motion, and breakpoints;
   application features must not use arbitrary one-off styling when a token exists.
3. Add Storybook for isolated states and accessibility review of reusable components.
4. Implement an accessible top navbar and responsive side drawer. Desktop may keep persistent
   navigation; mobile uses a focus-trapped drawer with keyboard and screen-reader support.
5. Add i18next and react-i18next with English as the only initial UI catalog. No user-visible text
   may be introduced outside typed translation resources after this migration.
6. Keep `uiLocale` separate from `contentLanguage`. The content language defaults from the locale
   when available but can be changed independently for browsing and quizzes.
7. Support left-to-right now while ensuring tokens and primitives can later support RTL.

Every future UI ticket must verify at least mobile, tablet, and desktop layouts; keyboard behavior;
visible focus; zoom/reflow; automated accessibility; and a Playwright critical path. Key shared
components also receive visual-regression snapshots at agreed breakpoints.

### Phase 4: Installable and safely updateable PWA (`PWA-001`)

1. Audit the existing application. It currently has no manifest, service worker, installability
   flow, or update prompt and therefore is not an updateable PWA.
2. Add a web manifest, complete icon set, offline fallback, and a Serwist-managed service worker in
   the target Next.js application.
3. Version every release and detect a waiting service worker. Display a persistent, accessible
   `New version available` banner with `Update now` and `Later` actions.
4. On confirmation, activate the waiting worker, reload once after controller change, and preserve
   unsaved form state or warn before reload. Never require manual cache clearing.
5. Test first install, offline shell, new-deployment detection, postponed update, accepted update,
   and recovery from a broken or stale worker in Playwright.
6. Add an in-app notification center first. Add opt-in Web Push using VAPID only after preferences,
   unsubscribe, retention, and privacy behavior are implemented.
7. Never request notification permission on first page load. Ask only after an explicit user action
   and explain the value first.

Initial notification events may include publication of a submitted word, moderation status,
important product changes, and an explicitly subscribed language's new content. Marketing messages
require separate consent.

### Phase 5: Core product journeys (`PROD-001`)

Deliver thin vertical slices through UI, API, database, authorization, analytics, and tests.

#### Word intensity rating

- Display one to five stars where 1 means mild and 5 means very strong.
- Show the aggregate, rating count, scale explanation, and the signed-in user's current rating.
- Make rating keyboard and screen-reader operable.
- Enforce one active rating per authenticated user and word, allow updates, prevent self-spam, and
  record moderation/abuse signals.
- Treat this as perceived intensity, not a generic like/dislike score.

#### Submit a new word

- Provide a validated form for language, country/region, word, meaning, intensity proposal,
  context, source, and optional translation equivalents.
- Save drafts locally, protect against accidental navigation, rate-limit submission, and reject
  duplicates where possible.
- New submissions enter moderation and are never published directly.
- Users can view the submission status and receive an in-app or opted-in push notification when it
  changes.

#### Administration

- Restrict all admin routes on the server with role-based authorization; hiding navigation is not
  access control.
- Provide moderation queues, word and translation editing, rating-abuse review, user/role controls,
  notification composition, and an immutable audit trail.
- Require confirmation and reason capture for destructive or publication actions.

#### Translation equivalents

- Model equivalence as a relationship between language-specific word records, not as columns added
  for each language.
- Allow multiple equivalents, regional variants, confidence, explanatory notes, and moderation.
- Initial planning assumption: a published multilingual entry should have at least one reviewed
  equivalent in another language. This must be confirmed before enforcing it as a publication rule.

#### Language quiz

- Start the quiz from the selected `contentLanguage`, initially defaulted from the i18next UI
  locale. Do not permanently couple quiz language to UI locale.
- Support configurable question count and at least meaning-to-word and word-to-meaning questions.
- Provide progress, accessible answer feedback, final score, corrections, and retry.
- Avoid exposing answers in the initial client payload and record attempts for signed-in users.

### Phase 6: Operability, delivery, and growth

1. Add container registry publication, SBOM generation, provenance, signing, vulnerability scanning,
   staging promotion, production approval, smoke checks, rollback, and deployment notifications.
2. Add structured logs, metrics, traces, dashboards, alerting, uptime/SLOs, migration monitoring,
   backups, and restore drills.
3. Add privacy controls, consent records, data export/deletion, moderation policy, abuse reporting,
   security headers at ingress, secret rotation, and dependency/image update automation.
4. Add SEO landing pages, structured data, sitemaps, canonical URLs, social previews, content
   analytics, and privacy-respecting product funnels.
5. Test monetization only after retention is measurable: contextual sponsorship, premium learning
   features, curated language packs, or an API. Advertising must remain consent-aware and must not
   degrade core performance.

## Initial route inventory

| Route                                              | Purpose                                                         | Access                            |
| -------------------------------------------------- | --------------------------------------------------------------- | --------------------------------- |
| `/`                                                | Marketing home, discovery, featured languages and words         | Public                            |
| `/map`                                             | Interactive geographical discovery                              | Public                            |
| `/languages`                                       | Language directory                                              | Public                            |
| `/languages/[language]`                            | Language landing page and learning entry point                  | Public                            |
| `/countries/[country]`                             | Country context and regional vocabulary                         | Public                            |
| `/words`                                           | Searchable and filterable word directory                        | Public                            |
| `/words/[word]`                                    | Meaning, intensity, context, ratings, and equivalents           | Public                            |
| `/quiz`                                            | Quiz configuration                                              | Public; sign-in for saved history |
| `/quiz/play`                                       | Active quiz session                                             | Public or authenticated           |
| `/quiz/results/[attempt]`                          | Results and corrections                                         | Owner                             |
| `/submit`                                          | New-word submission form                                        | Authenticated                     |
| `/submissions`                                     | User's submission history and status                            | Owner                             |
| `/notifications`                                   | In-app notification center                                      | Authenticated                     |
| `/settings`                                        | Locale, content language, privacy, and notification preferences | Authenticated                     |
| `/sign-in` and `/sign-up`                          | Authentication journeys                                         | Public                            |
| `/admin`                                           | Operational overview                                            | Admin/moderator                   |
| `/admin/submissions`                               | Moderation queue                                                | Admin/moderator                   |
| `/admin/words`                                     | Word, meaning, and source management                            | Admin/moderator                   |
| `/admin/translations`                              | Equivalent and translation review                               | Admin/moderator                   |
| `/admin/ratings`                                   | Rating-abuse review                                             | Admin/moderator                   |
| `/admin/users`                                     | User and role management                                        | Admin                             |
| `/admin/notifications`                             | Notification composition and delivery status                    | Admin                             |
| `/about`, `/methodology`, `/community-guidelines`  | Trust and editorial policy                                      | Public                            |
| `/privacy`, `/terms`, `/cookies`, `/accessibility` | Legal, consent, and accessibility                               | Public                            |
| `/offline`                                         | PWA offline recovery                                            | Public                            |

## Cross-cutting Definition of Done

Every product slice must include:

- linked ticket, reviewed schema/API/UI design, focused commits, PR, and release note;
- Fallow regression gate, format, lint, type, unit, integration, accessibility, and relevant E2E
  tests;
- responsive evidence at agreed breakpoints and no untranslated user-facing strings;
- authorization, validation, rate limiting, privacy, and abuse considerations;
- performance budgets and loading, empty, error, offline, and permission-denied states;
- structured logs, metrics, analytics event contract, and actionable failure diagnostics;
- backward-compatible migration or explicit deployment/rollback sequencing;
- updated docs and an owner for follow-up debt.

## Product decisions to confirm before implementation

1. Must every published word have an equivalent in another language, or only words included in a
   translation feature?
2. Can anonymous users rate, or is authentication mandatory? The roadmap recommends authentication
   to reduce abuse.
3. Which initial content languages and countries form the launch dataset?
4. Which notification events are transactional, community updates, or marketing?
5. Which roles are needed beyond `user`, `moderator`, and `admin`?
