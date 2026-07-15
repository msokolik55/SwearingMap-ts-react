# PERF-001: Reduce the initial map bundle

- Status: Backlog
- Priority: High

## Outcome

Users can open the initial product shell quickly without downloading the complete country geometry
dataset and map runtime up front.

## Evidence

The EPIC-00 production build emits a large-chunk warning. The main JavaScript artifact is about
2.86 MB minified and 972 kB gzip.

## Acceptance criteria

- The initial JavaScript bundle has an agreed, automated performance budget.
- Country geometry is simplified and delivered on demand as vector tiles or PMTiles.
- The interactive map is isolated from server-rendered content and loaded only when required.
- A Lighthouse performance budget runs in CI.
- Functional map behavior is covered by an end-to-end test before and after optimization.
