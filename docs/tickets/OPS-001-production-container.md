# OPS-001: Production container baseline

- Status: Done
- Priority: High
- Branch: `codex/ops-001-production-container`
- Delivered by: [`41ec73b`](https://github.com/msokolik55/SwearingMap-ts-react/commit/41ec73b),
  [`1085863`](https://github.com/msokolik55/SwearingMap-ts-react/commit/1085863)

## Outcome

The production build is packaged as a repeatable, non-root OCI container with an explicit runtime
contract and an automated smoke test.

## Business value

The same immutable artifact can be promoted between environments. Health checks, cache policy,
and browser security headers are versioned with the application instead of being configured by
hand after deployment.

## Scope

- Build the Vite application in a multi-stage Docker build.
- Serve only static production output from unprivileged Nginx on port 8080.
- Add a Docker health check and a lightweight `/healthz` endpoint.
- Add SPA routing, fingerprinted-asset caching, and bounded GeoJSON caching.
- Apply CSP and baseline browser security headers at the application runtime.
- Provide cross-platform build and smoke-test commands.
- Build and smoke-test the image in pull-request CI.
- Document the runtime decision and local workflow.

## Out of scope

- Selecting a cloud platform or container registry.
- TLS termination, HSTS, DNS, CDN, or public deployment.
- Image signing, SBOM publication, vulnerability scanning, and environment promotion.
- Kubernetes manifests or Helm charts before operational scale requires them.

## Acceptance criteria

- `pnpm container:build` produces the production image from a clean checkout.
- The runtime process is non-root and listens on port 8080.
- `/healthz` returns HTTP 200 with `ok`.
- Deep links fall back to the SPA entry point.
- HTML is revalidated, fingerprinted assets are immutable, and GeoJSON has a bounded cache policy.
- Responses include CSP, referrer, permissions, MIME-sniffing, and framing protection.
- `pnpm container:smoke` verifies the health endpoint, headers, and cache policies.
- CI blocks a pull request when the image cannot be built or its runtime contract fails.

## Definition of Done

- Existing quality, E2E, Lighthouse, dependency-audit, and bundle-budget gates remain green.
- Container smoke verification is green on a Linux CI runner.
- Runtime commands and the architecture decision are documented.
- Risks, rollback, and verification evidence are recorded.

## Risks and rollback

- The CSP can block a newly introduced external dependency. Extend it only through a reviewed code
  change with a concrete business need.
- Base-image tags can change within the selected release line. A later supply-chain ticket will pin
  digests and automate reviewed updates.
- HSTS is intentionally delegated to the future TLS ingress because emitting it over a local HTTP
  runtime would create a misleading contract.
- Roll back by deploying the previously validated immutable image; do not modify a running
  container.

## Verification evidence

- `pnpm check`: passed; formatting, lint, TypeScript, 5 Vitest files and 12 tests, production
  build, and all bundle budgets passed.
- `pnpm audit --audit-level high`: no known vulnerabilities.
- `pnpm test:e2e:ci`: 2 Playwright Chromium tests passed.
- `CI=true pnpm test:lighthouse:ci`: 3 Lighthouse runs and all assertions passed.
- `pnpm container:build`: built successfully with Node.js 24.14.0 and unprivileged Nginx 1.29.
- Runtime image size: 56,923,307 bytes; declared runtime user: `101`.
- Image metadata contains the `/healthz` Docker health check.
- `pnpm container:smoke`: health response, non-root user, SPA fallback, CSP, MIME-sniffing
  protection, HTML revalidation, immutable assets, and GeoJSON caching passed.
- `.dockerignore` excludes the local package store after the first diagnostic build exposed 417.7
  MiB of unnecessary context.
