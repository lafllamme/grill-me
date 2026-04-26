# Roast Payload Contract (v3.3)

Payload-first reference for request, AI payload, stream events, receipt flow, debug blocks, and canonical output.

Schema source:
- `/Users/flame/Developer/Projects/grill-me/shared/roast/contracts.ts`

## 1) Client -> API Request

```json
{
  "githubUsername": "lafllamme",
  "debugLevel": "full",
  "variationMode": "moderate",
  "roastIntensity": 4
}
```

## 2) Canonical Roast Output (sync + stream `done.data`)

```json
{
  "username": "lafllamme",
  "title": "Do You Ship Bugs Before Coffee Too?",
  "roastLines": ["..."],
  "roast": "...",
  "feedback": ["..."],
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

`receipt` is server-owned and required for:
- `POST /api/roast/share`
- `POST /api/leaderboard/submit`

## 3) AI Payload (`messages[].content`)

```json
{
  "username": "lafllamme",
  "commits": [
    {
      "repo": "lafllamme/grill-me",
      "sha": "fd791ad",
      "message": "feat: improve content box for roast",
      "additions": 39,
      "deletions": 20,
      "changedFiles": 2,
      "files": [
        {
          "filename": "app/components/RoastCard.vue",
          "status": "modified",
          "additions": 16,
          "deletions": 18,
          "patch": "@@ ..."
        }
      ]
    }
  ],
  "prs": []
}
```

Diff patches are included in `files[].patch` within prompt budgets.

## 4) Public SSE Events (Shape Snapshot)

```json
{"type":"meta","requestId":"a28ccb80","username":"lafllamme"}
{"type":"status","phase":"calling_ai","message":"Calling Cloudflare Workers AI..."}
{"type":"roast_title","title":"..."}
{"type":"roast_line","index":0,"text":"..."}
{"type":"feedback_item","index":0,"text":"..."}
{"type":"done","data":{"username":"lafllamme","title":"...","roastLines":["..."],"roast":"...","feedback":["..."],"metrics":{"spaghettiIndex":87.4,"stinkScore":88,"egoDamage":84,"grade":"D-","specialTitle":"Git Force Enthusiast"},"meta":{"commitCount":12,"prCount":0,"selectedCommitCount":8},"receipt":"<signed-hmac-receipt>"}}
```

Interleave allowed between `roast_line` and `feedback_item`.

## 5) Receipt / Share / Submit Payloads

Share request:

```json
{
  "receipt": "<signed-hmac-receipt>"
}
```

Share resolve response:

```json
{
  "token": "share_...",
  "expiresAt": "2026-04-27T12:00:00.000Z",
  "data": {
    "username": "lafllamme",
    "title": "...",
    "roastLines": ["..."],
    "roast": "...",
    "feedback": ["..."],
    "meta": { "commitCount": 12, "prCount": 0, "selectedCommitCount": 8 },
    "metrics": { "spaghettiIndex": 87.4, "stinkScore": 88, "egoDamage": 84, "grade": "D-", "specialTitle": "Git Force Enthusiast" }
  }
}
```

Submit request:

```json
{
  "receipt": "<signed-hmac-receipt>"
}
```

## 6) Candidate vs Selected Counts

- `meta.commitCount`: enriched/candidate commits fetched from GitHub.
- `meta.selectedCommitCount`: commits selected into prompt evidence.
- `debug.selectionSummary.configuredMaxCommitRefs`: candidate cap.
- `debug.selectionSummary.configuredMaxSelectedCommits`: selected cap.

## 7) Dev Logging View (Terminal + Browser)

Expected high-signal server scopes:
- `[server/roast/receipt-issued]`
- `[server/roast/share-created]`
- `[server/roast/share-resolved]`
- `[server/roast/official-submit-accepted]`
- `[server/roast/official-submit-rejected]`

Expected client scopes:
- `[client/roast/share-created]`
- `[client/roast/official-submit]`
- existing stream scopes (`stream-meta`, `stream-status`, `stream-roast-title`, `stream-roast-line`, `stream-feedback-item`, `stream-done`)

## 8) Persistence Rules

- Roast without login: no automatic persistence.
- Share: receipt-backed run is persisted + `roast_shares` token record with 24h TTL.
- Official submit: only verified self-roast can upsert official leaderboard entry.
