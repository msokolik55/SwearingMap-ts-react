# ARCH-001: Nx, Next.js, NestJS, and Prisma platform

- Status: Ready for review
- Slice 1 status: Done
- Slice 2 status: Done
- Slice 3 status: Done
- Slice 4 status: Done
- Slice 5 status: Ready for review
- Priority: Critical
- Depends on: DX-001
- Slice 5 branch: `codex/arch-001-auth-repositories`

## Outcome

The proof of concept becomes a typed, persistent modular product platform without a premature
microservice split.

## Scope

- Nx pnpm monorepo, Next.js App Router, NestJS API, and shared libraries.
- PostgreSQL/PostGIS development and integration-test environments.
- Prisma Schema, Client, Migrate, seed, repositories, and migration CI.
- Isolated geospatial repository for PostGIS-specific queries Prisma cannot express natively.
- OpenAPI generation, typed web client, authentication, authorization, and module boundaries.

## Acceptance criteria

- A clean checkout can start web, API, and database using documented commands.
- Migrations apply to an empty database and upgrade a representative previous schema.
- Prisma Client generation and committed OpenAPI artifacts are reproducible in CI.
- Unit and integration tests never share a developer or production database.
- Domain modules cannot bypass repository and authorization boundaries.

## Delivery slices

1. Migrate the existing Vite proof of concept into `apps/map`, introduce Nx 23 with inferred Vite,
   Vitest, and ESLint tasks, and make local/CI change selection use the Nx project graph.
2. Add the Next.js App Router shell and expose the map through an incremental route boundary.
3. Add the NestJS modular-monolith API and generated OpenAPI client.
4. Add PostgreSQL/PostGIS, Prisma schema, migrations, deterministic seeds, and isolated test data.
5. Add authentication, role authorization, repository boundaries, and geospatial integration tests.

Each slice must leave `main` deployable and receives an independent pull request. ARCH-001 remains
in progress until all acceptance criteria are satisfied; slice 5 completes those criteria and
moves the ticket to review.

## Slice 1 acceptance criteria

- `pnpm nx graph`, `pnpm nx show project map`, and cacheable project targets work from a clean
  checkout without a globally installed Nx CLI.
- The existing map runs, builds, and passes unit, browser, Lighthouse, and container checks from
  its `apps/map` project boundary.
- Local and pull-request verification uses `nx affected` with bounded parallelism; shared tooling
  changes still expand to full verification.
- Documentation-only changes do not execute map build, typecheck, or test targets.

## Slice 1 implementation evidence

- The existing Vite application now lives in the `apps/map` project with inferred Nx Vite,
  Vitest, and ESLint targets plus explicit typecheck and bundle-budget targets.
- Root scripts delegate deterministic work to cacheable Nx targets, while changed-file verification
  uses `nx affected` and escalates shared configuration changes to the complete quality suite.
- Docker builds install both workspace manifests before source code and serve
  `apps/map/dist` from the unprivileged Nginx runtime image.
- `pnpm nx show project map` and a daemon-free static `nx graph` complete successfully.
- Unit/tooling tests, production build, Playwright, Lighthouse CI, Fallow, and the production
  container smoke test pass. A repeated Nx quality run restores cacheable targets from cache.
- Security overrides keep Nx transitive `axios` and `brace-expansion` dependencies on patched
  releases, and the pull-request workflow always produces and uploads a valid Fallow SARIF report
  even when an earlier independent gate fails.

## Slice 2 acceptance criteria

- A typed Next.js App Router application owns the public product shell and is inferred by the Nx
  project graph without replacing the existing map implementation.
- The shell is statically exportable, responsive from mobile through desktop, and contains a clear
  route into the live product experience.
- The Vite proof of concept is mounted at `/map/`; its assets, GeoJSON request, SPA deep links,
  caching, security headers, and browser behavior remain functional.
- A single deterministic assembly command produces the artifact used by local preview, Lighthouse,
  Playwright, and the unprivileged production container.
- Changes in either web application select browser and Lighthouse CI, while unrelated
  documentation changes continue to skip them.

## Slice 2 implementation evidence

- `apps/web` uses Next.js 16 App Router, static export, TypeScript, the inferred Nx Next plugin, and
  the official Next core-web-vitals ESLint configuration.
- `pnpm build` builds both frontend projects and assembles `apps/web/out` with the Vite output under
  `dist/site/map`; local preview, Lighthouse, and the runtime image all consume that same artifact.
- The root shell and `/map/` route passed four Playwright scenarios, including the mobile viewport
  and an end-to-end navigation across the framework boundary.
- Lighthouse passed all assertions across three runs for each of `/` and `/map/`.
- Browser visual QA confirmed the desktop hierarchy and a mobile layout without horizontal
  overflow. The responsive design is guarded by both CSS breakpoints and Playwright.
- The clean Linux container build and smoke test validate the root shell, map SPA fallback, route
  assets, GeoJSON caching, immutable asset caching, security headers, and non-root runtime.
- The dependency audit contains no high-severity findings; the Next transitive `sharp` dependency is
  pinned from the affected `0.34.5` release to patched `0.35.3`.

## Slice 3 acceptance criteria

- An Nx-managed NestJS 11 application exposes URI-versioned endpoints from feature modules rather
  than a generic application controller.
- Swagger publishes a reviewable OpenAPI contract, and Hey API generates a TypeScript 6-compatible
  Fetch SDK from that contract.
- Contract and SDK generation is deterministic and available to local and CI verification.
- Unit and HTTP integration tests cover the first module and the generated client executes the
  published operation with a typed response.
- The API builds into a dedicated production image that declares a non-root user and passes a
  health/OpenAPI smoke test.

## Slice 3 implementation evidence

- `apps/api` is a NestJS modular-monolith boundary with a dedicated health module, strict global
  validation, `/api/v1` URI versioning, Swagger UI, and a machine-readable OpenAPI endpoint.
- `libs/api-client` exposes the generated Hey API Fetch SDK; the library depends on the API in the
  Nx graph. The later `DX-002` policy moved reproducible outputs out of Git into cacheable targets.
- Vitest covers the health service, an in-process HTTP application, Swagger publication, and a
  typed generated-client request against a controlled Fetch implementation.
- Local change-aware verification and CI generate the contract before relevant checks, while
  generated code is excluded from Git and hand-authored lint/format rules.
- `docker/api.Dockerfile` builds the pruned API dependency graph and runs it as the unprivileged
  Node user; the smoke test verifies both health and OpenAPI routes.

## Slice 4 acceptance criteria

- Docker Compose starts a persistent PostgreSQL 17/PostGIS 3.5 development database, while
  integration tests use a separate disposable database and never read the developer connection.
- Prisma ORM 7 owns a reviewable multi-file relational schema, generated client, initial migration,
  explicit PostgreSQL invariants, and deterministic idempotent seed data.
- A clean test database applies every committed migration, seeds representative multilingual
  content, matches the Prisma schema without drift, and proves PostGIS and rating constraints.
- NestJS exposes Prisma through a global database module and requires an explicit production
  `DATABASE_URL`; normal unit and health tests do not require a running database.
- Prisma schema validation, client generation, and relevant database integration tests are selected
  through Nx, local changed-file verification, and an isolated GitHub Actions job.

## Slice 4 implementation evidence

- `docker/compose.yml` pins the recommended `postgis/postgis:17-3.5-alpine` image and separates the
  persistent development service from a `tmpfs` test profile.
- The initial migration creates all planned platform entities, PostGIS geography support, indexes,
  foreign keys, and database CHECK constraints for intensity, confidence, equivalence, and quiz
  invariants.
- The seed is safe to run repeatedly and creates roles, English and Slovak reference data, two
  countries, representative published words, meanings, and a reviewed translation-equivalent
  relationship.
- `pnpm test:database` applies migrations to an empty uniquely named Compose project, seeds it,
  rejects schema drift, runs real Prisma/PostGIS tests, and guarantees cleanup after failures.
- Prisma models are grouped into identity, geography, vocabulary, moderation, learning, and
  notification schema files. Prisma Client is ignored and generated as a cacheable prerequisite of
  API tasks. `DX-002` applies the same policy to OpenAPI and typed-client outputs.
- NestJS receives the Prisma client through an explicitly injected global database module, while
  production startup rejects a missing `DATABASE_URL` and contract generation remains database
  independent.
- Dependency overrides keep Prisma and NestJS transitive `find-my-way` and `lodash` releases on
  patched versions; the production and development audits have no unignored high-severity finding.
- The full monorepo quality gate, Fallow baseline checks, clean-database integration suite, and
  non-root API container build and smoke test pass before review.

## Slice 5 acceptance criteria

- Registration and sign-in hash passwords with Argon2id, issue bounded JWT access tokens, and
  persist only digests of rotating opaque refresh tokens.
- API routes are authenticated by default; anonymous routes are explicit, roles are enforced by a
  reusable guard, and abusive authentication traffic is throttled.
- Domain services depend on repository contracts. Static checks prevent direct Prisma access
  outside database infrastructure, repository adapters, and integration tests.
- PostGIS proximity lookup is isolated behind a geospatial repository and uses only parameterized
  tagged raw queries.
- Unit, HTTP, and isolated real-database tests cover configuration, credentials, roles, refresh
  rotation and revocation, authorization defaults, and spatial distance behavior.

## Slice 5 implementation evidence

- The authentication module exposes registration, sign-in, refresh, logout, and identity endpoints
  through generated OpenAPI contracts. Production rejects missing or weak JWT signing secrets.
- Passwords use OWASP's Argon2id baseline cost; refresh tokens are random, single-use, atomically
  rotated, and stored only as SHA-256 digests. The browser-token transport constraint is recorded
  in the authentication runbook before UI integration.
- Global JWT, role, and throttling guards make new API endpoints private and rate-limited by
  default. `@Public()` and `@Roles(...)` make deviations reviewable in source.
- Authentication and geography services depend on injected repository interfaces. ESLint and a
  workspace contract test reject persistence bypasses and unsafe Prisma raw-query APIs.
- A dedicated Prisma migration adds password credentials and case-normalized email uniqueness.
  Deterministic seed coordinates let the PostGIS repository prove distance ordering and radius
  filtering against an isolated migrated database.
- The complete monorepo check, Fallow baselines, dependency audit, isolated PostGIS suite, and
  pruned non-root API container build and smoke test pass before review.
