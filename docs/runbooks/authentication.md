# Authentication and authorization

The API uses short-lived signed JWT access tokens and rotating opaque refresh tokens. Access is
secure by default: a controller route is private unless it carries `@Public()`. `@Roles(...)`
narrows an authenticated route to one or more roles, and persistence stays behind an injected
repository interface.

## Local setup

Copy the documented values from `.env.example` into the local environment and start the database
before the API:

```sh
pnpm db:up
pnpm db:migrate
pnpm dev:api
```

Development and test processes have a non-production fallback signing key. Production startup
fails unless `AUTH_ACCESS_TOKEN_SECRET` contains at least 32 characters. Generate a unique,
high-entropy secret in the deployment secret manager; never commit it or reuse the example value.
The issuer and audience default to `swearing-map-api` and `swearing-map-web`.

## Session lifecycle

The versioned endpoints live below `/api/v1/auth`:

- `POST /register` creates an account, hashes its password with Argon2id, assigns the baseline
  `USER` role, and starts a session.
- `POST /sign-in` verifies credentials and starts a session.
- `POST /refresh` accepts a single-use refresh token and atomically rotates it.
- `POST /logout` revokes the active refresh token.
- `GET /me` requires both a valid bearer access token and the `USER` role.

Access tokens expire after 15 minutes. Refresh sessions expire after 30 days. The database stores
only a SHA-256 digest of each random refresh token, so a database leak does not disclose usable
session credentials. Reusing a rotated or revoked token fails.

The current transport returns the opaque refresh token to API clients. Native clients must use
their platform credential store. The browser UI must not persist it in `localStorage` or
`sessionStorage`; its authentication integration must move refresh transport to a same-origin,
`Secure`, `HttpOnly`, `SameSite` cookie (or a BFF) before browser sign-in is released.

## Adding protected functionality

Inject a domain repository token into the service rather than importing `PrismaService`. Only
database infrastructure, `*.repository.ts` adapters, and database integration tests may access
Prisma directly. ESLint and `scripts/architecture-boundaries.test.mjs` enforce that boundary and
reject Prisma's unsafe raw-query APIs.

Declare anonymous access deliberately:

```ts
@Public()
@Get("catalog")
findCatalog() {}
```

Authenticated routes need no marker. Add role authorization when the operation is privileged:

```ts
@Roles(RoleKey.ADMIN)
@Post("moderation/approve")
approveSubmission() {}
```

Use the parameterized tagged Prisma raw-query API only inside a reviewed repository when a PostGIS
operation cannot be expressed by the normal Prisma query builder.

## Verification

```sh
pnpm nx typecheck api
pnpm nx test api
pnpm test:database
pnpm test:tooling
pnpm audit
```

The database suite applies every migration to an isolated PostGIS instance and exercises account,
session rotation, revocation, and geospatial-distance behavior against the real database.
