# PERF-003: Enforce Lighthouse quality thresholds

- Status: Ready for review
- Priority: High
- Parent: `PERF-001`
- Branch: `codex/perf-003-lighthouse-ci`

## Outcome

Every pull request is evaluated in a real browser against explicit user-facing quality thresholds.

## Business value

Performance, accessibility, SEO, and browser best-practice regressions are detected before merge,
and the project demonstrates a measurable web-performance workflow rather than relying only on
bundle size.

## Scope

- Add Lighthouse CI as a development dependency.
- Audit the Vite production preview with Playwright's pinned Chromium binary.
- Run three desktop samples to reduce single-run noise.
- Enforce minimum category scores and a maximum cumulative layout shift.
- Block public OpenStreetMap tile requests during collection to remove external network variance.
- Store local HTML and JSON reports in an ignored output directory.
- Run the same assertions in pull-request CI after Playwright tests.
- Document local commands and update PERF-001 progress.
- Override vulnerable LHCI transitive packages with patched compatible releases.

## Out of scope

- Mobile Lighthouse thresholds.
- Historical Lighthouse dashboards or an LHCI server.
- Uploading reports to public temporary storage.
- Replacing the public map-tile provider.
- Vector-tile conversion and route-level map deferral.

## Acceptance criteria

- `pnpm test:lighthouse` builds the application and runs three Lighthouse audits.
- Collection uses the Chromium revision already pinned by Playwright.
- External OSM tile requests do not influence audit results.
- CI fails below 0.80 performance or below 0.90 accessibility, SEO, or best-practices scores.
- CI fails when cumulative layout shift exceeds 0.10.
- Reports are written locally without being committed or uploaded publicly.
- Existing type, unit, component, E2E, build, and bundle-budget gates remain green.

## Definition of Done

- Lighthouse assertions pass for all collected runs.
- `pnpm check`, `pnpm test:e2e:ci`, peer checks, and `pnpm audit` pass.
- Thresholds and results are recorded below.
- CI timeout remains bounded.

## Risks and rollback

- Lighthouse metrics contain normal runtime variance. Three desktop runs and conservative initial
  thresholds reduce false failures; tighten limits only from measured CI history.
- LHCI adds a large development-only dependency tree. Remove its package, config, scripts, and CI
  step together if maintenance or security cost becomes unacceptable.

## Verification evidence

- `pnpm check`: passed; 5 Vitest files and 12 tests passed.
- `pnpm test:e2e:ci`: 2 Playwright Chromium tests passed.
- Lighthouse CI 0.15.1: 3 desktop runs and all assertions passed.
- Performance scores: 97–100 against the minimum score of 80.
- Accessibility, best practices, and SEO: 100 in all three runs against minimum scores of 90.
- FCP: 364–379 ms; LCP: 373–1,318 ms; TBT: 0–6 ms; CLS: 0.
- Added a valid `robots.txt` after the first audit exposed Vite's HTML fallback at that route;
  subsequent SEO scores improved from 91 to 100.
- Windows collection reuses an LHCI-managed Puppeteer session, preventing the upstream
  chrome-launcher temporary-profile cleanup failure.
- Security overrides: `tmp` 0.2.7 and LHCI's `uuid` 11.1.1; LHCI passed after both overrides.
- `pnpm peers check`: no peer dependency issues found.
- `pnpm audit`: no known vulnerabilities.
