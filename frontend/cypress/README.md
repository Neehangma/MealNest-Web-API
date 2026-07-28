# MealNest Cypress tests

These browser tests cover only workflows that exist in the MealNest frontend:
public navigation, authentication, the user dashboard, reservations, restaurant
details and admin review management.

## Prerequisites

Start the existing MealNest frontend and backend yourself before running Cypress:

- Frontend: `http://localhost:3000`
- Backend: `NEXT_PUBLIC_API_URL`, falling back to `http://localhost:8088`

Authenticated specs use dedicated test accounts. Set these environment variables
in the terminal that launches Cypress; never commit real credentials:

```text
CYPRESS_TEST_USER_EMAIL=
CYPRESS_TEST_USER_PASSWORD=
CYPRESS_TEST_ADMIN_EMAIL=
CYPRESS_TEST_ADMIN_PASSWORD=
```

Optional overrides:

```text
CYPRESS_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8088
```

Specs that need credentials are reported as pending when their corresponding
variables are absent. Public navigation and public authentication checks do not
need credentials.

## Commands

```bash
npm run test:e2e
npm run test:e2e:open
```

The existing Playwright suite remains available through:

```bash
npm run test:e2e:playwright
```
