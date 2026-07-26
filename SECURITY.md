# Security policy

## Reporting a vulnerability

Do not disclose suspected vulnerabilities in a public issue. Use GitHub private vulnerability
reporting when it is enabled for this repository. If that channel is unavailable, contact the
repository owner privately and include reproduction steps, impact, and affected versions without
including real user data or secrets.

You should receive an acknowledgement within five working days. A remediation timeline depends
on severity and exploitability. Coordinated disclosure will follow after a fix is available.

## Supported versions

Until the first stable release, only the latest commit on `main` is supported.

## Dependency audit policy

CI audits production dependencies at `high` severity without exceptions. Development dependencies
use the same threshold, with one scoped exception for `GHSA-mh99-v99m-4gvg`: legacy glob tooling
requires pre-5 `brace-expansion`, while the advisory has no compatible patched release for those
major versions. The affected packages process repository-controlled glob patterns only and are not
included in either production container. Compatible 5.x consumers are forced to patched `5.0.8`.
Remove the exception when upstream ESLint/Lighthouse dependencies stop resolving the legacy major.
