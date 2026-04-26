# Roast Docs (v3.4)

Documentation is split by responsibility and optimized for fast onboarding.

## Document Set

1. `api.md`
- Public endpoint behavior, request/response contracts, and endpoint error matrix.

2. `stream-contract.md`
- Typed SSE event protocol, interleave rules, canonical `done`, fail-fast behavior.

3. `payload-contract.md`
- Request/output payloads, receipt handoff, share/submit payloads, and persistence semantics.

4. `architecture.md`
- End-to-end system flow, ownership boundaries, invariants, and sequence diagram.

5. `database.md`
- DB tables, constraints, indexes, persistence rules, and ER diagram.

6. `operations.md`
- Neon operational runbook (`pg_cron`, 4h TTL cleanup, verification, recovery).

## Recommended Reading by Goal

For API integrators:
1. `api.md`
2. `stream-contract.md`
3. `payload-contract.md`

For backend maintainers:
1. `architecture.md`
2. `database.md`
3. `operations.md`
4. `api.md`

For troubleshooting share/leaderboard issues:
1. `operations.md`
2. `api.md`
3. `payload-contract.md`

## UI entrypoints

- `/leaderboard` (official Wall of Shame)
- `/share/:token` (temporary unofficial shared roast)
