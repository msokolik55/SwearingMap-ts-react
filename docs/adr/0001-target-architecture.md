# ADR-0001: Target product architecture

- Status: Accepted
- Date: 2026-07-15

## Context

The current repository is a client-only proof of concept. The target product needs
indexable content pages, moderation, an API, persistent data, background work, and an
automated delivery lifecycle while remaining understandable to a small team.

## Decision

Build an Nx-managed pnpm monorepo containing:

- a Next.js App Router web application;
- a NestJS modular-monolith API;
- an optional NestJS/BullMQ worker when asynchronous work is introduced;
- shared domain, contract, UI, and configuration libraries;
- PostgreSQL with PostGIS as the primary database;
- MapLibre with generated vector tiles or PMTiles for the interactive map.

Start with a modular monolith. Introduce separately deployed services only when measured
scaling, ownership, or reliability requirements justify them.

## Consequences

- Server-rendered country and term pages can support SEO while the map remains interactive.
- OpenAPI can generate the web API client and prevent contract drift.
- Module boundaries and Nx dependency rules can enforce architectural ownership.
- The team operates more infrastructure than a client-only SPA, so observability, migrations,
  backups, and deployment automation become mandatory.
