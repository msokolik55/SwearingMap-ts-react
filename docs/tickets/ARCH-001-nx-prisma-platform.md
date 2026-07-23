# ARCH-001: Nx, Next.js, NestJS, and Prisma platform

- Status: In progress
- Slice 1 status: Done
- Slice 2 status: Ready for review
- Priority: Critical
- Depends on: DX-001
- Branch: `codex/arch-001-next-shell`

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
- Generated Prisma and OpenAPI artifacts are reproducible and checked for drift in CI.
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
in progress until all acceptance criteria are satisfied.

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
