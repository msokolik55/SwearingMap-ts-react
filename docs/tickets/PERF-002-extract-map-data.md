# PERF-002: Extract map data and enforce a bundle budget

- Status: Done
- Priority: High
- Parent: `PERF-001`
- Branch: `codex/perf-002-extract-map-data`
- Delivered by: [`6f64f87`](https://github.com/msokolik55/SwearingMap-ts-react/commit/6f64f87)

## Outcome

Country geometry is downloaded as an independently cacheable resource and automated CI checks
prevent it from returning to the initial JavaScript bundle.

## Business value

Visitors receive a materially smaller executable bundle, deployments can cache code and data
independently, and performance regressions fail during development instead of reaching production.

## Scope

- Move the existing GeoJSON from the source graph to a static data asset.
- Load and minimally validate country borders through a reusable React hook.
- Preserve the current map and country-selection behavior.
- Display accessible loading and recoverable error states.
- Generate a Vite manifest and enforce raw, gzip, and dataset size budgets after every build.
- Cover data loading, validation, selection, loading, and failure behavior with tests.

## Out of scope

- Simplifying geometry or converting it to vector tiles or PMTiles.
- Deferring the map route itself.
- Running Lighthouse in CI.
- Replacing OpenStreetMap's public tile endpoint.

## Acceptance criteria

- The initial JavaScript no longer contains the 2.46 MB border dataset.
- `/data/borders.json` is emitted as a separate production artifact without content changes.
- The application renders the base map while country geometry loads.
- Loading and request failures are announced to assistive technology.
- Invalid or unsuccessful data responses do not crash the application.
- Production builds fail when initial JavaScript or border data exceed their declared budgets.
- Existing country selection and popup behavior remains covered by tests.

## Definition of Done

- `pnpm check`, bundle budgets, and `pnpm audit` pass.
- The generated manifest identifies and measures the initial JavaScript graph.
- Build measurements and test evidence are recorded below.
- PERF-001 remains open for vector tiles, route-level deferral, and Lighthouse automation.

## Risks and rollback

- The map now depends on a second HTTP request. The base map remains usable while it loads and an
  explicit error is shown if it fails.
- Static hosting must publish the `data` directory copied by Vite. Revert the loader and move the
  file back into `src` if a target platform cannot serve public assets.

## Verification evidence

- `pnpm check`: passed.
- Vitest: 5 test files and 12 tests passed.
- Production build: passed in 287 ms.
- Initial JavaScript: reduced from 2,832.04 kB to 370.62 kB raw.
- Initial JavaScript gzip: reduced from 962.67 kB to 114.29 kB as reported by Vite;
  the budget measurement is 113,192 bytes.
- Border data: 2,464,519 bytes against a 2,600,000-byte budget.
- Initial JavaScript: 370,620 bytes against a 500,000-byte raw budget and 113,192 bytes
  against a 180,000-byte gzip budget.
- Git blob integrity: source, moved public asset, and production artifact all have hash
  `26c3c444223452130a2aea99dbe371f0af7e2cfc`.
- `pnpm audit`: no known vulnerabilities.
