# DX-001: Local and CI quality gates

- Status: In progress
- Priority: Critical
- Depends on: OPS-001

## Outcome

Developers and AI agents receive fast local feedback, while protected CI/CD independently blocks
quality regressions and unverified artifacts.

## Scope

- Add Fallow with a reviewed baseline, regression policy, machine-readable output, and CI artifact.
- Run Fallow in agent verification, pre-push, PR CI, and the release pipeline.
- Add Husky, lint-staged, and commit-message validation.
- Add `verify:staged`, `verify:changed`, `fallow:audit`, `verify:push`, `verify:ci`, `verify:full`,
  and `push:safe` commands.
- Keep hooks cross-platform and avoid running the complete suite at every commit.
- Resolve changed files from the merge base rather than only the latest commit, including renames
  and deletions, and map them to related tests and Nx affected projects.
- Bound local task parallelism and skip unrelated E2E, Lighthouse, container, database, and PWA
  suites through reviewed path/affected-project rules.
- Document emergency hook bypasses while making clear that CI cannot be bypassed.

## Acceptance criteria

- Pre-commit formats and lints only staged supported files.
- Pre-push blocks changed-code Fallow regressions, related test failures, and failed Nx affected
  lint, typecheck, or build targets without scanning unrelated projects.
- `pnpm push:safe` safely pushes the current branch and configures an upstream when absent.
- Pull-request CI uses the same reviewed change graph and extends local guarantees only with checks
  relevant to the affected projects and paths.
- Shared dependency, lockfile, Nx, TypeScript, lint, test, CI, or build configuration changes trigger
  a full verification because their impact cannot be safely isolated.
- Pushes to `main`, releases, scheduled drift checks, and `pnpm verify:full` run the complete suite so
  incorrect affected rules cannot accumulate undetected regressions.
- Release jobs require green CI and Fallow before publishing an image.
- Existing findings are baselined explicitly and thresholds only move toward stricter enforcement.

## Change-selection contract

- Staged scope: `git diff --cached` with add/copy/modify/rename handling.
- Branch scope: merge base of `HEAD` and the configured base branch, not `HEAD~1`.
- File checks: Prettier, ESLint, and Fallow receive only supported changed paths.
- Tests: use related-test selection initially and Nx affected test targets after migration.
- Types and builds: run at affected-project level; checking a TypeScript file in isolation is not a
  safe substitute for project type checking.
- Expensive suites: path and project rules select database integration, E2E, Lighthouse, Storybook,
  PWA multi-version, and container smoke tests.
- Safety fallback: missing base refs, ambiguous dependency impact, or change-selector failure causes
  a full check rather than silently passing.

## Implementation progress

- Fallow 3.7 is installed with signed-binary verification and a two-thread changed-code audit.
- Husky runs lint-staged at pre-commit, commitlint at commit-msg, and change-aware verification at
  pre-push.
- `pnpm push:safe` rejects `main`, configures a missing upstream, and delegates approval to Husky.
- The current single-project application uses related Vitest selection and project-level TypeScript
  and build checks; Nx affected targets replace this mapping after ARCH-001.
- Pull-request CI runs Fallow against complete Git history before the existing full quality suite.
- CI retains the machine-readable Fallow SARIF report for 14 days even when the audit fails.
- Affected PR job selection and scheduled full drift verification remain open.
