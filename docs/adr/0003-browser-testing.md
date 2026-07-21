# ADR-0003: Browser end-to-end testing

- Status: Accepted
- Date: 2026-07-21

## Context

Unit and jsdom component tests do not exercise Vite production output, browser networking,
Leaflet's SVG rendering, or real pointer interaction. The project needs a repeatable browser gate
that can run locally and in pull-request CI without depending on public map-tile availability.

## Decision

- Use Playwright Test for browser end-to-end tests.
- Run tests against the built Vite production preview.
- Use Playwright's pinned Chromium revision as the initial required PR project.
- Stub external map tiles while exercising the real local GeoJSON request.
- Retain traces and screenshots on failure.
- Add Firefox, WebKit, mobile, and visual-regression projects only when product risk justifies their
  additional CI cost.

## Consequences

- Critical integration behavior is verified in a real browser before merge.
- Browser downloads increase initial local setup and CI duration.
- Chromium-only coverage does not prove cross-browser compatibility; this limitation is explicit
  and tracked for future expansion.
- Tests must prefer observable user behavior and controlled network boundaries over implementation
  details.
