# ARCH-001: Nx, Next.js, NestJS, and Prisma platform

- Status: Backlog
- Priority: Critical
- Depends on: DX-001

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
