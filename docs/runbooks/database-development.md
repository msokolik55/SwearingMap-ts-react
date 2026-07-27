# Database development runbook

## Purpose

The application uses PostgreSQL 17, PostGIS 3.5, and Prisma ORM 7. Docker Compose provides a
persistent development database, while integration tests use a separate one-shot database backed
by `tmpfs`. Development, test, staging, and production connection strings must never overlap.

## Local setup

```sh
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm dev:api
```

The documented development URL is:

```text
postgresql://swearing_map:swearing_map@127.0.0.1:5432/swearing_map?schema=public
```

These credentials are local-only defaults. Copy `.env.example` to an ignored `.env.local` if a
different port or credential is needed. Stop the service with `pnpm db:down`. The named Docker
volume intentionally survives a normal stop.

## Schema change workflow

The schema uses Prisma's multi-file layout. `apps/api/prisma/schema.prisma` contains only the
generator and datasource; models and their enums are grouped by domain in
`apps/api/prisma/models`:

- `identity.prisma` — users, roles, and sessions
- `geography.prisma` — languages and countries
- `vocabulary.prisma` — words, meanings, equivalents, sources, and ratings
- `moderation.prisma` — submissions and moderation decisions
- `learning.prisma` — quizzes
- `notifications.prisma` — in-app and push notification data

1. Change the relevant domain schema file.
2. Run `pnpm db:migrate:dev -- --name <descriptive-name>`.
3. Review the generated SQL, locks, backfill needs, and compatibility with the currently deployed
   application.
4. Add CHECK constraints or PostGIS SQL that Prisma cannot model directly.
5. Run `pnpm db:generate`. The output under `apps/api/src/generated/prisma` is ignored and must not
   be committed.
6. Run `pnpm db:check` and `pnpm test:database`.

`pnpm db:check` validates the complete schema folder and regenerates the client. API build, test,
development startup, and OpenAPI tasks depend on the same generation step, so a clean checkout does
not rely on committed generated code.

Do not rewrite a migration after it has reached a shared environment. Correct it with a new
forward migration. Destructive changes require an expand-and-contract rollout or an explicit
maintenance plan.

## Isolated integration tests

`pnpm test:database` creates a unique Docker Compose project on port 5433, applies every committed
migration to an empty PostGIS database, runs the deterministic seed, compares the live database
with the Prisma schema, executes Vitest integration tests, and removes the project in a `finally`
cleanup. Set `POSTGRES_TEST_PORT` when port 5433 is already occupied.

The test connection is created inside the command and is never read from the development
`DATABASE_URL`. This prevents a test reset or cleanup from touching developer or production data.

## Deployment and recovery

Release automation must run `prisma migrate deploy` once before starting application instances that
require the new schema. The deployment identity needs schema-migration permissions; the runtime
identity should receive only application permissions in a later security-hardening slice.

Prisma migrations are forward-only by default. Before a risky migration, document the forward-fix
and restore strategy, take a verified backup, and test recovery against a representative copy.
Never run `prisma migrate reset` against staging or production.
