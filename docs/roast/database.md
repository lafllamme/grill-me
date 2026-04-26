# Roast Database (v1.2)

Neon/Postgres schema for receipt-backed share links and verified official leaderboard entries.

## Tables

1. `roast_users`
- one row per roasted GitHub username
- identity + timestamps

2. `roast_runs`
- one row per persisted run (`request_id` unique, idempotent)
- run-level metadata (source, intensity, counts, model, prompt version)

3. `roast_run_content`
- 1:1 with `roast_runs`
- title, roast lines, feedback, full roast text

4. `roast_run_metrics`
- 1:1 with `roast_runs`
- deterministic metrics + `metric_version`

5. `roast_user_stats`
- 1:1 with `roast_users`
- aggregated counters for reads/debugging

6. `roast_scoring_profiles`
- versioned scoring config
- active profile selected by `is_active = true`

7. `auth_github_users`
- verified OAuth users (`github_id` unique)
- session identity for official submit ownership

8. `roast_shares`
- temporary share tokens (`token`, `run_id`, `expires_at`)
- public read path for `/share/:token`

9. `leaderboard_entries`
- official board projection
- one row per roasted user (`roast_user_id` PK) -> latest official run

## Constraints

- FK chains use `ON DELETE CASCADE` for run content/metrics/shares/entries.
- `roast_intensity` constrained to `1..4`.
- score fields constrained to `0..100`.
- grade constrained to `F- | F | D- | D | C- | C | B | A`.

## Indexes

- Existing:
  - `roast_users(username)`
  - `roast_runs(created_at DESC)`
  - `roast_runs(user_id, created_at DESC)`
  - `roast_run_metrics(stink_score DESC, ego_damage DESC)`
  - `roast_user_stats(worst_grade, avg_stink_score DESC)`
- New v1.2:
  - `auth_github_users(username)`
  - `roast_shares(expires_at)`
  - `roast_shares(run_id)`
  - `leaderboard_entries(submitted_at DESC)`
  - `leaderboard_entries(run_id)`

## Migrations

- `/Users/flame/Developer/Projects/grill-me/server/db/migrations/001_roast_leaderboard.sql`
- `/Users/flame/Developer/Projects/grill-me/server/db/migrations/002_roast_share_and_official_entries.sql`

## Persistence Rules

- Unofficial roast (no login): no automatic DB write.
- Share: persists run + share token (24h).
- Official leaderboard submit: persists/upserts run and updates official `leaderboard_entries`.

## TTL Cleanup

`roast_shares` should be cleaned by scheduled SQL job:

```sql
DELETE FROM roast_shares
WHERE expires_at <= NOW();
```

Optional orphan cleanup (non-official, non-shared runs):

```sql
DELETE FROM roast_runs rr
WHERE rr.created_at < NOW() - INTERVAL '7 days'
  AND NOT EXISTS (SELECT 1 FROM roast_shares rs WHERE rs.run_id = rr.id)
  AND NOT EXISTS (SELECT 1 FROM leaderboard_entries le WHERE le.run_id = rr.id);
```

## Data Hygiene

- Debug payloads and raw AI dumps are not persisted in DB tables.
- Receipt signature is not stored; server verifies it per action request.
