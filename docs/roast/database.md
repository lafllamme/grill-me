# Roast Database (v1.1)

Neon/Postgres schema for roast persistence and leaderboard queries.

## Tables

1. `roast_users`
- one row per GitHub username
- identity + timestamps

2. `roast_runs`
- one row per roast execution
- run-level metadata only (intensity, counts, model, prompt version)

3. `roast_run_content`
- 1:1 with `roast_runs`
- title, roast lines, feedback, full roast text

4. `roast_run_metrics`
- 1:1 with `roast_runs`
- deterministic metrics: `spaghetti_index`, `stink_score`, `ego_damage`, `grade`, `special_title`, `metric_version`

5. `roast_user_stats`
- 1:1 with `roast_users`
- pre-aggregated all-time stats + latest run pointer

6. `roast_scoring_profiles`
- versioned scoring configuration
- active profile selected by `is_active = true`

## Constraints

- FK chains use `ON DELETE CASCADE` from users -> runs -> content/metrics.
- `roast_intensity` constrained to `1..4`.
- score fields constrained to `0..100`.
- grade constrained to `F- | F | D- | D | C- | C | B | A`.

## Indexes

- `roast_users(username)`
- `roast_runs(created_at DESC)`
- `roast_runs(user_id, created_at DESC)`
- `roast_run_metrics(stink_score DESC, ego_damage DESC)`
- `roast_user_stats(worst_grade, avg_stink_score DESC)`

## Migration

Initial schema migration:
- `/Users/flame/Developer/Projects/grill-me/server/db/migrations/001_roast_leaderboard.sql`

## Data Hygiene

- Debug payloads and raw AI dumps are not persisted in DB tables.
- Leaderboard reads use pre-aggregated user stats for all-time and windowed aggregation for 24h.
