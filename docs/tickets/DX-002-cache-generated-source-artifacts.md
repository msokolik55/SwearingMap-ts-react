# DX-002: Cache generated source artifacts outside Git

- Status: Ready for review
- Priority: High
- Branch: `codex/chore-generated-artifacts-cache`

## Outcome

Every reproducible source artifact is ignored by Git and Docker build contexts, generated through
the Nx dependency graph, and restored from cache when its reviewed inputs have not changed.

## Business value

Pull requests contain only intentional source changes, reviewers do not spend time on generated
noise, repository growth is reduced, and developers and CI avoid repeating unchanged code
generation.

## Scope

- Remove Prisma Client, OpenAPI JSON, and Hey API SDK outputs from version control.
- Preserve schemas, migrations, controllers, DTOs, generator configuration, scripts, package
  manifest, and lockfile as reviewed generation inputs.
- Model Prisma, OpenAPI, and SDK generation as cacheable Nx targets with explicit outputs.
- Add a single `pnpm generate` entry point and generation prerequisites for all consumers.
- Restore `.nx/cache` before the dedicated GitHub Actions generation step.
- Guard the policy through `.gitignore`, `.dockerignore`, and tooling contract tests.
- Document clean-checkout and contributor workflows.

## Acceptance criteria

- `git ls-files` contains none of the declared generated source outputs.
- A clean checkout can run `pnpm generate`, typecheck, tests, Fallow, and production builds.
- A second unchanged `pnpm generate` run is served from Nx cache.
- Generator input changes invalidate the appropriate target.
- Local change-aware verification generates artifacts before Fallow resolves imports.
- CI restores the Nx task cache and runs code generation as a distinct quality step.
- Generated outputs cannot be added accidentally without explicitly overriding `.gitignore`.

## Risks and rollback

- Incorrect target inputs could restore stale code. Contract tests assert the dependency graph,
  inputs are limited to reviewed sources, and clean-checkout verification exercises consumers.
- Developers importing the client before generation receive missing-module errors. `pnpm generate`,
  `pnpm check`, Fallow, typecheck, and tests all request generation automatically.
- Rollback is limited to restoring the removed generated files and previous target definitions; no
  runtime data or database migration is changed.

## Verification evidence

- Generated outputs were physically removed before verification; `pnpm generate` recreated Prisma
  Client, OpenAPI JSON, and the Hey API SDK from a clean-output state.
- First generation: 3 targets executed successfully in 7.8 seconds.
- Second unchanged generation: 3/3 targets restored from local Nx cache in 86 milliseconds.
- Tooling contracts: 34/34 passed, including Git/Docker ignore, cache outputs, target dependencies,
  and CI ordering.
- `pnpm fallow:full`: passed against the existing dead-code, health, and duplication baselines.
- `pnpm check`: formatting, lint, typecheck, 16 application/library tests, 34 tooling tests, bundle
  budgets, and all production builds passed.
- Web and API production images built successfully from Docker contexts that exclude host-generated
  source artifacts.
- `git ls-files` returned no declared generated source output.
