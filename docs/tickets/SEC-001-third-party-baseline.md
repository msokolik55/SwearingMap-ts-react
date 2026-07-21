# SEC-001: Establish a third-party content baseline

- Status: Ready for review
- Priority: Critical
- Branch: `codex/sec-001-third-party-baseline`

## Outcome

The application starts without executing advertising or CDN-hosted JavaScript before a user has
made a consent choice.

## Business value

The product has a safer privacy baseline, a smaller third-party attack surface, and an explicit
review path for future analytics and monetization integrations.

## Scope

- Remove the duplicate AdSense integration until consent and brand-safety work is complete.
- Remove CDN copies of Leaflet and the unused Leaflet Draw plugin.
- Bundle the required Leaflet stylesheet with the application.
- Document the third-party integration policy and the remaining map-tile dependency.
- Add a regression test for remote scripts, styles, and advertising markup.

## Out of scope

- Implementing a consent-management platform.
- Selecting a commercial or self-hosted map-tile service.
- Adding analytics or an alternative monetization model.
- Defining production HTTP security headers.

## Acceptance criteria

- Given a visitor opens the application, when the HTML loads, then no advertising script or ad
  markup is present.
- Given the production build is inspected, when external scripts and styles are reviewed, then
  they are served from the application bundle.
- Given the application is built, when the map renders, then Leaflet styling remains available.
- Given a future change adds a remote script, stylesheet, or AdSense markup to `index.html`, when
  unit tests run, then the third-party baseline test fails.
- The remaining OpenStreetMap tile request and its production replacement requirement are
  documented.

## Definition of Done

- Acceptance criteria are covered by automated checks where practical.
- `pnpm check` and `pnpm audit` pass.
- The production output contains no AdSense, unpkg, cdnjs, or Leaflet Draw references.
- Verification evidence and rollback notes are recorded in this ticket.

## Risks and rollback

- Advertising revenue is intentionally disabled. Re-enable it only through a reviewed follow-up
  ticket after consent and brand-safety requirements are met.
- If local Leaflet CSS is missing in production, revert this change while preserving the removal
  of unused and advertising scripts.

## Verification evidence

- `pnpm check`: passed.
- Vitest: 2 test files and 4 tests passed.
- Production build: passed; Leaflet rules are present in the generated CSS bundle.
- Artifact scan: no AdSense, Google Syndication, unpkg, cdnjs, or Leaflet Draw references.
- `pnpm audit`: no known vulnerabilities.
