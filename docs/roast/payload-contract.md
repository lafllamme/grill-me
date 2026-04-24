# Roast Payload Contract (v3)

Payload-first reference for request, AI payload, stream events, and canonical done output.

Type source of truth:
- `/Users/flame/Developer/Projects/grill-me/shared/roast/contracts.ts`

## 1) Client -> API request

```json
{
  "githubUsername": "lafllamme",
  "debugLevel": "full",
  "variationMode": "moderate",
  "roastIntensity": 4
}
```

## 2) Normalized runtime

```json
{
  "includeDebug": true,
  "debugLevel": "full",
  "githubTimeoutMs": 12000,
  "cfAiTimeoutMs": 25000,
  "cfAiMaxTokens": 2200,
  "cfAiTemperature": 0.55,
  "cfAiTopP": 0.92,
  "variationMode": "moderate",
  "roastIntensity": 4
}
```

## 3) AI user payload (what is sent as `messages[].content`)

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

Yes, prompt payload contains commit file diffs (`files[].patch`) within budget limits.

## 4) Stream v3 public SSE events

```json
{"type":"meta","requestId":"a28ccb80","username":"lafllamme"}
{"type":"status","phase":"calling_ai","message":"Calling Cloudflare Workers AI..."}
{"type":"roast_title","title":"Monorepo Meltdown"}
{"type":"roast_line","index":0,"text":"..."}
{"type":"feedback_item","index":0,"text":"..."}
{"type":"done","data":{"username":"lafllamme","title":"Monorepo Meltdown","roastLines":["..."],"roast":"...","feedback":["..."],"meta":{"commitCount":12,"prCount":0,"selectedCommitCount":8}}}
```

Interleave is allowed between `roast_line` and `feedback_item`.

## 5) Internal model -> server NDJSON contract (stream mode)

Model must output NDJSON lines:

```json
{"type":"title","title":"Monorepo Meltdown"}
{"type":"roast_line","index":0,"text":"..."}
{"type":"feedback_item","index":0,"text":"..."}
{"type":"done"}
```

Server parses incrementally and emits typed SSE events immediately.

## 6) Canonical done payload

Required fields in `done.data`:
- `title`
- `roastLines`
- `feedback`

If required structure is missing, server returns typed error (`cloudflare_ai_incomplete_output`) instead of auto-filling text.

## 7) Candidate vs selected commit counts

- `meta.commitCount`: enriched/candidate commit count collected from GitHub.
- `meta.selectedCommitCount`: commits actually selected into prompt evidence.
- `debug.selectionSummary.configuredMaxCommitRefs`: configured candidate cap.
- `debug.selectionSummary.configuredMaxSelectedCommits`: configured selected cap.
