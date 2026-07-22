# Fallow baselines

These generated identity baselines record reviewed findings that existed when DX-001 was adopted.
Pull-request and scheduled audits fail on findings not represented here. Baseline changes require a
focused review and must never be used to hide an unexplained regression.

- `dead-code.json`: unused files, exports, dependencies, and graph findings.
- `health.json`: complexity and maintainability findings.
- `dupes.json`: duplication clone identities.

Regenerate a file only after the corresponding finding has been reviewed. Baselines should shrink
as existing debt is removed.
