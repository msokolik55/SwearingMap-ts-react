# QA-001: Add Playwright end-to-end coverage

- Status: Done
- Priority: High
- Branch: `codex/qa-001-playwright-e2e`
- Delivered by: [`ebd0c34`](https://github.com/msokolik55/SwearingMap-ts-react/commit/ebd0c34)

## Outcome

Critical map behavior is verified in a real browser on every pull request.

## Business value

The team receives automated feedback on integration failures that unit tests cannot detect, while
the project demonstrates practical Playwright and CI experience relevant to modern frontend roles.

## Scope

- Add Playwright with a Chromium desktop project.
- Run tests against the Vite production preview rather than the development server.
- Verify map loading, attribution, country selection, and vocabulary popup behavior.
- Verify a recoverable UI when the country dataset is unavailable.
- Stub third-party map tiles to keep tests independent of external availability.
- Install Chromium and run the E2E suite in existing pull-request CI.
- Document local browser installation and test commands.
- Upgrade TypeScript to the newest release supported by the configured typescript-eslint toolchain.

## Out of scope

- Cross-browser and mobile projects.
- Visual-regression snapshots.
- Lighthouse performance audits.
- Testing the availability or correctness of OpenStreetMap tile servers.

## Acceptance criteria

- `pnpm test:e2e` builds and tests the production application locally.
- CI installs a pinned Playwright Chromium revision and runs E2E tests after the build.
- The happy-path test waits for the real border artifact, renders the map, preserves attribution,
  selects a polygon, and observes a non-empty popup.
- The failure-path test controls the border response and observes the accessible recovery message.
- Tests do not depend on public map-tile network availability.
- Playwright traces and screenshots are retained locally when a test fails.
- TypeScript and ESLint packages have no peer dependency conflicts.

## Definition of Done

- Unit/component quality gates continue to pass.
- Playwright tests pass in local Chromium.
- `pnpm audit` reports no known vulnerabilities.
- Commands and CI behavior are documented.
- Verification evidence is recorded below.

## Risks and rollback

- Browser installation increases CI duration. The initial suite uses only Chromium and one CI
  worker to keep resource use predictable.
- If GitHub-hosted runners cannot install the browser, temporarily disable only the E2E steps while
  retaining tests and configuration; do not weaken the existing quality gate.

## Verification evidence

- `pnpm check`: passed.
- Vitest: 5 test files and 12 tests passed.
- Playwright 1.61.1 with Chromium 149: 2 tests passed against the production preview.
- Happy path: real GeoJSON response, visible map and attribution, SVG polygon click, and non-empty
  vocabulary popup verified.
- Failure path: controlled HTTP 503 response, accessible recovery alert, and usable base map
  verified.
- TypeScript: upgraded from 4.9.5 to 6.0.3; application and E2E projects pass type checking.
- `pnpm peers check`: no peer dependency issues found.
- Production build and all three bundle budgets: passed.
- `pnpm audit`: no known vulnerabilities.
