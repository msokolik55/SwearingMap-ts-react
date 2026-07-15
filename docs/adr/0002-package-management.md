# ADR-0002: Node.js and package management

- Status: Accepted
- Date: 2026-07-15

## Context

The repository contains both npm and pnpm lockfiles and does not declare a supported runtime.
This makes dependency resolution dependent on each developer's workstation.

## Decision

- Use Node.js 24 for local development and CI.
- Use pnpm 11.13.0 through Corepack.
- Keep only `pnpm-lock.yaml` in version control.
- Use `pnpm install --frozen-lockfile` in CI.
- Update dependencies through reviewed automation rather than unpinned installs in CI.

## Consequences

- Clean checkouts and CI resolve the same dependency graph.
- Runtime upgrades require an explicit ADR update and a dedicated pull request.
- Contributors must enable Corepack or install the pinned pnpm release.
