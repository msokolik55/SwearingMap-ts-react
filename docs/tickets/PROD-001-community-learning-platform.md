# PROD-001: Community learning platform

- Status: Backlog
- Priority: High
- Depends on: ARCH-001, UI-001

## Outcome

Users can discover, assess, contribute, translate, and learn vocabulary while moderators maintain
content quality and traceability.

## Scope

- One-to-five perceived-intensity ratings.
- Public word, language, country, directory, and map pages.
- Authenticated submission form and submission-status history.
- Moderation and administration pages with audit trails.
- Translation-equivalent relationships across languages.
- Language-based quiz with progress, results, corrections, and saved attempts.
- Settings, authentication, notifications, trust, legal, and offline supporting pages.

## Acceptance criteria

- Each journey is delivered as a tested vertical slice through UI, API, database, and authorization.
- Ratings are accessible, updateable, aggregated, and protected against trivial duplicate voting.
- Submissions cannot bypass moderation and expose visible status to their owner.
- Admin routes enforce roles on the server and record sensitive actions.
- Translation relationships support multiple equivalents and regional/context notes.
- Quiz language is selectable independently while defaulting from the current supported UI locale.
- The route inventory in the target roadmap is implemented or explicitly deferred by a ticket.
