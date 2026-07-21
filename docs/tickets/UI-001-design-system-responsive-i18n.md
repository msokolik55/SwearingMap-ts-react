# UI-001: Design system, responsive shell, and i18n

- Status: Backlog
- Priority: High
- Depends on: ARCH-001

## Outcome

Every product journey uses a consistent, accessible, responsive UI foundation ready for additional
locales.

## Scope

- Tailwind CSS, shadcn/ui, semantic tokens, and Storybook.
- Responsive navbar and accessible side drawer.
- i18next and react-i18next with an English initial catalog.
- Separate UI locale and content-language preferences.
- Automated accessibility, breakpoint E2E, and shared-component visual regression.

## Acceptance criteria

- No new user-facing literal strings exist outside translation resources.
- Core routes pass at mobile, tablet, and desktop breakpoints without horizontal overflow.
- Navigation is fully usable by keyboard and screen reader, with correct focus management.
- Shared components expose documented variants rather than feature-specific styling forks.
- CI builds Storybook and runs accessibility and critical responsive checks.
