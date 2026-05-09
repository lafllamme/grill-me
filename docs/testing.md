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
