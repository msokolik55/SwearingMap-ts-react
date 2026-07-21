# Third-party content baseline

## Current policy

Executable scripts and styles are served from the application bundle. Advertising, analytics,
and other non-essential third-party integrations must not load before an approved consent and
privacy design is implemented.

The application currently makes one essential third-party request: map tiles are loaded from the
OpenStreetMap tile service and rendered with the required attribution. This dependency must be
replaced by a production-ready tile provider or self-hosted tiles before commercial launch.

## Adding an integration

Any new external integration requires:

- a ticket documenting purpose, data flow, owner, retention, and removal strategy;
- privacy and security review, including Content Security Policy changes;
- consent classification and proof that the integration is blocked until consent when required;
- automated tests for the default no-consent state;
- monitoring, service limits, and a documented fallback.

Ad monetization remains disabled until the product has an approved consent-management platform,
privacy documents, and a brand-safety decision suitable for the product's language content.
