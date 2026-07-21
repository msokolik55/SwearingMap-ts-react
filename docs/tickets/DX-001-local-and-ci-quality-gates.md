# DX-001: Local and CI quality gates

- Status: Backlog
- Priority: Critical
- Depends on: OPS-001

## Outcome

Developers and AI agents receive fast local feedback, while protected CI/CD independently blocks
quality regressions and unverified artifacts.

## Scope

- Add Fallow with a reviewed baseline, regression policy, machine-readable output, and CI artifact.
- Run Fallow in agent verification, pre-push, PR CI, and the release pipeline.
- Add Husky, lint-staged, and commit-message validation.
- Add `verify:staged`, `fallow:audit`, `verify:push`, `verify:ci`, and `push:safe` commands.
- Keep hooks cross-platform and avoid running the complete suite at every commit.
- Document emergency hook bypasses while making clear that CI cannot be bypassed.

## Acceptance criteria

- Pre-commit formats and lints only staged supported files.
- Pre-push blocks Fallow regressions and failed affected checks.
- `pnpm push:safe` safely pushes the current branch and configures an upstream when absent.
- Pull-request CI repeats and extends all local guarantees.
- Release jobs require green CI and Fallow before publishing an image.
- Existing findings are baselined explicitly and thresholds only move toward stricter enforcement.
