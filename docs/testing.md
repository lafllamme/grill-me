# Testing (Remote/Local Quick Guide)

## Package Manager

Use `pnpm` for all commands in this repository.

## One-time setup

```bash
pnpm install
pnpm test:e2e:install
```

## Daily validation before merge

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:e2e
```

You can also run everything with:

```bash
pnpm check
```

## Environment safety

- Do not edit real `.env` files in automated tasks.
- Document required variables only in `.env.example` or `.env.local.example`.
- Keep secrets out of logs, tests, and snapshots.

## Manual checklist additions

- Verify roast stream renders progressively on slow 3G throttle.
- Check intensity levels 1–5 produce visibly different tone.
- Confirm audio toggle persists across reloads.
- Decision: keep stream rendering check as documented for now.
- Decision: keep error state coverage as documented for now.
