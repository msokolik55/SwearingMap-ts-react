# PWA-001: Safe updates and notifications

- Status: Backlog
- Priority: High
- Depends on: UI-001

## Outcome

The installable application updates without manual cache clearing and delivers consent-based,
manageable notifications.

## Scope

- Manifest, icons, Serwist service worker, offline fallback, and installability checks.
- Waiting-worker detection and an accessible new-version banner.
- Safe reload with unsaved-form protection and stale-worker recovery.
- In-app notification center, preferences, and delivery/read state.
- Opt-in Web Push subscriptions using VAPID, unsubscribe, expiration cleanup, and privacy controls.

## Acceptance criteria

- A deployed new version shows an update banner on an already controlled client.
- `Update now` activates the release and reloads once; `Later` keeps the session functional.
- Users never need to clear browser cache to receive a release.
- Notification permission is requested only after an explicit, contextual user action.
- Users can disable each optional notification category and remove their push subscription.
- Playwright covers install/update/offline flows; API integration tests cover notification delivery.
