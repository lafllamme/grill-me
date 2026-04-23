# Testing Guide

This project uses:

- `vitest` for fast unit/schema tests
- `playwright` for end-to-end smoke tests (API + UI flow)

## Install and setup

```bash
pnpm install
pnpm exec playwright install
```

## Test commands

- Unit tests (CI-safe):

```bash
pnpm test:unit
```

- Unit tests in watch mode:

```bash
pnpm test:unit:watch
```

- E2E tests (starts Nuxt on `:4173` via Playwright webServer):

```bash
pnpm test:e2e
```

- E2E with browser UI:

```bash
pnpm test:e2e:headed
```

- E2E debug mode:

```bash
pnpm test:e2e:debug
```

- Full suite:

```bash
pnpm test:all
```

## Roast-specific verification

For changes in roast pipeline (`server/roast/*`, `server/api/roast*`, `app/composables/useRoast.ts`, landing terminal components):

1. Run:

```bash
pnpm test:unit
pnpm test:e2e
```

2. Manual API sanity checks:

```bash
curl -sS 'http://localhost:3000/api/roast' \
  -H 'content-type: application/json' \
  --data '{"githubUsername":"lafllamme","debugLevel":"full"}' | jq '.'

curl -sN 'http://localhost:3000/api/roast/stream' \
  -H 'content-type: application/json' \
  --data '{"githubUsername":"lafllamme","debugLevel":"full"}'
```

3. Confirm stream event order:

- `meta`
- `status` (zero or more)
- `typing_roast` (one or more)
- `feedback_item` (one or more)
- optional `debug`
- `done` or `error`

Legacy compatibility notes:

- older servers may emit `typing` instead of `typing_roast`
- older servers may emit `feedback` instead of `feedback_item`

## Notes for agents

- Prefer deterministic tests and assert contracts first.
- If E2E fails because browsers are missing, run:

```bash
pnpm exec playwright install
```

- Always report:
  - which commands were run
  - pass/fail status
  - first failing assertion or upstream error envelope
