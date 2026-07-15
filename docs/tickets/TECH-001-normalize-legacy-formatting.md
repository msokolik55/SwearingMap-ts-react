# TECH-001: Normalize legacy formatting

- Status: Backlog
- Priority: Low

## Outcome

Remove the temporary legacy entries from `.prettierignore` without mixing mechanical formatting
changes into feature or foundation pull requests.

## Acceptance criteria

- Each temporarily ignored source or configuration file is formatted with the repository Prettier
  configuration.
- The formatting-only change contains no behavior changes.
- All temporary legacy entries are removed from `.prettierignore`.
- `pnpm check` passes.

## Delivery notes

Use a dedicated pull request and review with whitespace-insensitive diffing. Merge it before large
feature work begins in these files to reduce future conflicts.
