# Roast Payload Contract (v3.1)

Payload-first reference for request, AI payload, stream events, debug blocks, and final canonical output.

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

## 2) Normalized Runtime

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

## 4) Public SSE Events

```json
{"type":"meta","requestId":"a28ccb80","username":"lafllamme"}
{"type":"status","phase":"calling_ai","message":"Calling Cloudflare Workers AI..."}
{"type":"roast_title","title":"Monorepo Meltdown"}
{"type":"roast_line","index":0,"text":"..."}
{"type":"feedback_item","index":0,"text":"..."}
{"type":"done","data":{"username":"lafllamme","title":"Monorepo Meltdown","roastLines":["..."],"roast":"...","feedback":["..."],"meta":{"commitCount":12,"prCount":0,"selectedCommitCount":8}}}
```

Interleave allowed between `roast_line` and `feedback_item`.

## 5) Internal Model Stream Envelope

```json
{"type":"title","title":"Monorepo Meltdown"}
{"type":"roast_line","index":0,"text":"..."}
{"type":"feedback_item","index":0,"text":"..."}
{"type":"done"}
```

Server parses this incrementally, supports split/concatenated JSON chunks, then emits typed SSE.

## 6) Canonical `done.data`

Required fields:
- `title`
- `roastLines`
- `feedback`

If missing after parser normalization, server emits typed `error` (`cloudflare_ai_incomplete_output`).

## 7) Debug Contract Pointers

Useful debug fields:
- `debug.parserPath`: final parse path used for canonical response
- `debug.ai.ndjsonInvalidLineCount`: skipped invalid stream fragments
- `debug.selectionSummary`: candidate vs selected summary
- `debug.intensityProfile`: resolved runtime profile

## 8) Candidate vs Selected Counts

- `meta.commitCount`: enriched/candidate commits fetched from GitHub.
- `meta.selectedCommitCount`: commits selected into prompt evidence.
- `debug.selectionSummary.configuredMaxCommitRefs`: candidate cap.
- `debug.selectionSummary.configuredMaxSelectedCommits`: selected cap.
