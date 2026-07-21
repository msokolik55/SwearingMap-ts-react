# TECH-002: Stabilize map state and React keys

- Status: Ready for review
- Priority: High
- Branch: `codex/tech-002-stable-map-state`

## Outcome

Country selection uses React's local state and map elements retain stable identities across
renders.

## Business value

Map interaction becomes easier to maintain and test, unnecessary legacy dependencies are removed,
and React avoids destroying and recreating every polygon and word element after state changes.

## Scope

- Replace the global Recoil atom with state owned by the map component.
- Pass country selection through an explicit callback.
- Replace render-time UUID keys with stable country and word keys.
- Remove the unused Recoil and UUID packages.
- Cover selectable and unavailable countries with component tests.

## Out of scope

- Migrating from Leaflet to MapLibre.
- Changing country geometry or vocabulary data.
- Implementing server-side state or persistence.
- Solving the complete PERF-001 map bundle target.

## Acceptance criteria

- Clicking a country with vocabulary selects it and opens the existing popup behavior.
- Countries without vocabulary do not render as interactive polygons.
- Polygon keys are derived from ISO country codes and remain stable between renders.
- Word keys are deterministic and support duplicate values.
- Runtime code and dependency manifests contain no Recoil or UUID usage.
- Component tests cover both selectable and unavailable countries.

## Definition of Done

- `pnpm check` and `pnpm audit` pass.
- Recoil and UUID are removed from the manifest and lockfile.
- The production build remains functional.
- Verification evidence is recorded in this ticket.

## Risks and rollback

- Selection state is intentionally local to the map. If another page needs it before the planned
  application migration, introduce state at the nearest shared React owner rather than restoring a
  global dependency.
- Revert this commit if the popup interaction regresses.

## Verification evidence

- `pnpm check`: passed.
- Vitest: 4 test files and 7 tests passed, including selection-to-popup integration.
- `pnpm audit`: no known vulnerabilities.
- Production build: passed.
- Runtime modules: reduced from 86 to 64.
- Main JavaScript bundle: reduced from 2,908.18 kB to 2,832.04 kB minified and from
  986.01 kB to 962.67 kB gzip.
- Source and dependency scan: no remaining Recoil or UUID usage.
