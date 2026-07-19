# Roast API (v3.5)

Public HTTP contract for roast generation, temporary sharing, verified official submit, and leaderboard reads.

Policy baseline: **Roast anyone. Share temporarily. Submit only yourself.**

Intensity semantics:
- `roastIntensity` remains numeric (`1..4`) at the API boundary.
- Internal profile labels use steak levels: `rare`, `medium_rare`, `medium`, `burned_to_crisp`.

## Endpoints

- `POST /api/roast`
  - synchronous roast response (canonical payload + signed `receipt`)
- `POST /api/roast/stream`
  - SSE stream (`meta/status/evidence/roast_title/roast_line/feedback_item/debug/done/error`)
- `POST /api/roast/share`
  - creates temporary share token from valid `receipt`
- `GET /api/roast/share/:token`
  - resolves unofficial shared snapshot until expiry
- `POST /api/leaderboard/submit`
  - official submit; requires verified GitHub session and self-ownership
- `GET /api/leaderboard?window=all|24h&limit=50&search=...`
  - official leaderboard list only
- `GET /api/leaderboard/:username`
  - official run history/detail for one username
- `GET /api/auth/session`
  - current auth/session summary
- `POST /api/auth/logout`
  - clears session
- `GET /auth/github`
  - GitHub OAuth callback entrypoint

Schema source of truth:
- `/Users/flame/Developer/Projects/grill-me/shared/roast/contracts.ts`

## Endpoint Behavior Notes

### Roast generation

`POST /api/roast`
- Validates request + resolves runtime options.
- Runs full pipeline and returns one canonical payload.
- Returns signed `receipt` for downstream share/submit.

`POST /api/roast/stream`
- Emits typed SSE events during execution.
- Streams progressive content from an incrementally parsed JSON model response instead of waiting for one final blob.
- `done.data` is canonical final truth and includes `receipt`.
- On failure emits typed `error` event envelope only after progressive parser state and raw-text fallback parsing both fail to produce a complete final payload.

### Share lifecycle

`POST /api/roast/share`
- Verifies `receipt` signature + expiry.
- Persists run/content/metrics (if not already persisted by `request_id`).
- Creates `roast_shares` token with 24h TTL.
- Returns `token`, `shareUrl`, `expiresAt`.

`GET /api/roast/share/:token`
- Resolves share token to an unofficial public snapshot.
- Fails with `404` when token is missing/expired/not found.
- Setup/database errors are mapped to typed setup codes.

### Official submit

`POST /api/leaderboard/submit`
- Requires valid GitHub session.
- Verifies `receipt` signature + expiry.
- Enforces `session.login === receipt.username`.
- Upserts official row (`leaderboard_entries`) with latest run.

### Leaderboard reads

`GET /api/leaderboard`
- Reads from official projection only (`leaderboard_entries` joins).
- Supports `window=all|24h`, `limit`, and username search.

`GET /api/leaderboard/:username`
- Returns official detail/history for the username.
- `404` if no official entry exists.

### Auth endpoints

`GET /auth/github`
- OAuth callback stores normalized session on success and redirects `/`.
- Redirect query failure states:
  - `auth=github_not_configured`
  - `auth=github_session_failed`
  - `auth=github_invalid_profile`
  - `auth=github_failed`

`GET /api/auth/session`
- Returns `{ loggedIn, user }` for UI state.

`POST /api/auth/logout`
- Clears session and returns `{ ok: true }`.

## Canonical Roast Response Shape

Used by `POST /api/roast` and by stream `done.data`:

```json
{
  "username": "lafllamme",
  "intensity": {
    "level": 4,
    "label": "burned_to_crisp"
  },
  "title": "Do You Ship Bugs Before Coffee Too?",
  "roastLines": ["Line 1", "Line 2"],
  "roast": "Line 1 Line 2",
  "feedback": ["Action 1", "Action 2", "Action 3"],
  "metrics": {
    "spaghettiIndex": 87.4,
    "stinkScore": 88,
    "egoDamage": 84,
    "grade": "D-",
    "specialTitle": "Git Force Enthusiast"
  },
  "meta": {
    "commitCount": 12,
    "prCount": 0,
    "selectedCommitCount": 8
  },
  "receipt": "<signed-hmac-receipt>"
}
```

Notes:
- `intensity` is part of the canonical roast response and mirrors the effective roast level used for generation.
- persistence still stores numeric `roast_intensity`; public payloads expose both `level` and semantic `label`.

## Error Envelope

```json
{
  "error": {
    "code": "<stable_code>",
    "message": "<human_readable_message>"
  }
}
```

## Error Matrix by Endpoint

| Endpoint | Main error codes |
|---|---|
| `POST /api/roast` | `invalid_username`, `github_not_found`, `github_timeout`, `github_upstream_error`, `rate_limited`, `cloudflare_ai_not_configured`, `cloudflare_ai_timeout`, `cloudflare_ai_error`, `cloudflare_ai_empty_output`, `cloudflare_ai_unparseable_output`, `cloudflare_ai_incomplete_output`, `receipt_secret_missing` |
| `POST /api/roast/stream` | same as roast path, returned as stream `error` event |
| `POST /api/roast/share` | `receipt_secret_missing`, `receipt_invalid`, `receipt_invalid_signature`, `receipt_invalid_payload`, `receipt_expired`, `database_not_configured`, `leaderboard_schema_missing` |
| `GET /api/roast/share/:token` | `share_token_missing`, `share_not_found`, `database_not_configured`, `leaderboard_schema_missing` |
| `POST /api/leaderboard/submit` | `github_auth_required`, `receipt_secret_missing`, `receipt_invalid`, `receipt_invalid_signature`, `receipt_invalid_payload`, `receipt_expired`, `official_submit_not_owner`, `database_not_configured`, `leaderboard_schema_missing` |
| `GET /api/leaderboard` | `database_not_configured` (degraded mode may return empty list) |
| `GET /api/leaderboard/:username` | HTTP 400 `Username is required`, HTTP 404 `Leaderboard entry not found` |
| `GET /auth/github` | redirect states via `auth=` query param |

Related docs:
- `stream-contract.md`
- `payload-contract.md`
- `architecture.md`
- `database.md`
- `operations.md`
