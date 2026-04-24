# Testing Guide

This project uses:
- `vitest` for unit/contract tests
- `playwright` for E2E smoke/integration checks

## Install

```bash
pnpm install
pnpm exec playwright install
```

## Commands

```bash
pnpm test:unit
pnpm test:e2e
pnpm test:all
```

## Roast Pipeline Validation

For roast-related changes (`server/roast/*`, roast APIs, `app/composables/useRoast.ts`, roast terminal components), run:

```bash
pnpm exec eslint .
pnpm exec nuxi typecheck
pnpm test:unit
pnpm test:e2e
```

Roast documentation references:
- `/Users/flame/Developer/Projects/grill-me/docs/roast/index.md`
- `/Users/flame/Developer/Projects/grill-me/docs/roast/api.md`
- `/Users/flame/Developer/Projects/grill-me/docs/roast/stream-contract.md`
- `/Users/flame/Developer/Projects/grill-me/docs/roast/payload-contract.md`
- `/Users/flame/Developer/Projects/grill-me/docs/roast/architecture.md`

## Manual Smoke Checks

### Sync

```bash
curl -sS 'http://localhost:3000/api/roast' \
  -H 'content-type: application/json' \
  --data '{"githubUsername":"lafllamme","debugLevel":"full","roastIntensity":2}' | jq '.'
```

### Stream

```bash
curl -sN 'http://localhost:3000/api/roast/stream' \
  -H 'content-type: application/json' \
  --data '{"githubUsername":"lafllamme","debugLevel":"full","roastIntensity":2}'
```

Expected stream order:
- `meta`
- `status` (0..n)
- `roast_title` (1)
- `roast_line` / `feedback_item` (1..n, interleaved allowed)
- optional `debug`
- `done` or `error`

## Acceptance Criteria

- First content event appears before `done`.
- `done.data` includes `title`, `roastLines`, and `feedback`.
- `done.data` is consistent with previously streamed content events.
- Parser/normalizer failures produce typed `error` envelopes.

## Reporting Rules

When reporting test results, always include:
- executed commands
- pass/fail state
- first failing assertion or upstream error code
