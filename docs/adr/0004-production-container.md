# ADR-0004: Production container runtime

- Status: Accepted
- Date: 2026-07-21

## Context

The Vite application has a repeatable build but no versioned production runtime. Serving it through
ad hoc platform settings would make routing, caching, security headers, and health behavior differ
between environments.

## Decision

- Package the application as a multi-stage OCI image.
- Compile with the repository's Node.js major version and keep build tooling out of the runtime.
- Serve static files with the unprivileged Nginx image on port 8080.
- Treat `/healthz`, SPA fallback, response headers, and cache policy as a tested runtime contract.
- Terminate TLS and apply HSTS at the future ingress or CDN boundary.
- Defer orchestration technology until a selected hosting target or measured scale requires it.

## Consequences

- Environments can promote the same immutable artifact and detect runtime regressions in CI.
- The production image has a smaller attack surface and does not require root at runtime.
- Nginx configuration becomes application-owned code that requires review and maintenance.
- Base images become supply-chain dependencies that need future scanning, digest pinning, and
  automated update policy.
