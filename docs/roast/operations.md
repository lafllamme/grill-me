# Roast Operations (v1.0)

Operational runbook for share-token TTL cleanup and Neon `pg_cron` setup.

## Purpose

Keep `roast_shares` physically clean by deleting expired rows while preserving functional share behavior and official leaderboard data.

## Prerequisites

- Neon project/endpoint identifiers
- Neon API key with endpoint update permissions
- Compute that remains active for cron execution (avoid scale-to-zero for reliable schedules)

## Step 1: Enable `pg_cron` on the target database

Set `cron.database_name` on your Neon endpoint and restart compute.

```bash
curl --request PATCH \
  --url "https://console.neon.tech/api/v2/projects/<project_id>/endpoints/<endpoint_id>" \
  --header 'accept: application/json' \
  --header "authorization: Bearer <NEON_API_KEY>" \
  --header 'content-type: application/json' \
  --data '{
    "endpoint": {
      "settings": {
        "pg_settings": {
          "cron.database_name": "<database_name>"
        }
      }
    }
  }'

curl --request POST \
  --url "https://console.neon.tech/api/v2/projects/<project_id>/endpoints/<endpoint_id>/restart" \
  --header 'accept: application/json' \
  --header "authorization: Bearer <NEON_API_KEY>"
```

## Step 2: Install extension + cleanup function + schedule

Run in Neon SQL editor:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION cleanup_expired_roast_shares()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM roast_shares
  WHERE expires_at <= NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM cron.job
    WHERE jobname = 'cleanup-expired-roast-shares'
  ) THEN
    PERFORM cron.unschedule('cleanup-expired-roast-shares');
  END IF;
END
$$;

SELECT cron.schedule(
  'cleanup-expired-roast-shares',
  '0 */4 * * *',
  $$SELECT cleanup_expired_roast_shares();$$
);
```

## Step 3: Verify

```sql
SELECT *
FROM cron.job
WHERE jobname = 'cleanup-expired-roast-shares';

SELECT *
FROM cron.job_run_details
WHERE jobid IN (
  SELECT jobid
  FROM cron.job
  WHERE jobname = 'cleanup-expired-roast-shares'
)
ORDER BY start_time DESC
LIMIT 20;
```

## Expected Failure Signals and Recovery

- **`leaderboard_schema_missing`**
  - Cause: missing migration `002_roast_share_and_official_entries.sql`
  - Action: apply migration, rerun share/submit flow

- **`database_not_configured`**
  - Cause: `NUXT_DATABASE_URL` missing in runtime
  - Action: set env + restart app server

- **No cron executions in `cron.job_run_details`**
  - Cause: compute sleeping, cron not enabled on DB, or schedule not installed
  - Action: wake/keep compute active, verify `cron.database_name`, recreate schedule

- **Share resolves return `share_not_found` unexpectedly**
  - Cause: token expired/cleaned, wrong environment DB, or wrong token
  - Action: inspect `roast_shares` for token and `expires_at`, issue fresh share link

## Notes

- All cron schedules are interpreted in UTC.
- Cleanup only removes expired rows from `roast_shares`; it does not delete official leaderboard entries.

## Runbook notes

- Stream error rate > 2% over 10 min: check upstream model status first.
- Rate limit tuning lives in env, not code — adjust without redeploys.
- Cold starts spike p95; keep the warm-up ping enabled in production.
- Edge case: warm-up ping on mobile safari needs a second look.
- Reminder: sync warm-up ping docs with implementation changes.
- Decision: keep p95 tracking as documented for now.
- Open question: does rate limit envs need its own section?
