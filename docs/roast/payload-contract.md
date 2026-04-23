# Roast Payload Contract (v1)

This document is the payload-first reference for debugging and feature planning.
It answers:

- what is sent
- what is received
- what is kept in debug
- which log scope corresponds to which stage

Source of truth for validation types:  
`/Users/flame/Developer/Projects/grill-me/shared/roast/contracts.ts`

## 1) Client -> API request payload

Used for both:

- `POST /api/roast`
- `POST /api/roast/stream`

```json
{
  "githubUsername": "lafllamme",
  "includeDebug": true,
  "debugLevel": "full",
  "variationMode": "moderate",
  "stream": true
}
```

Notes:

- `githubUsername` is required.
- `debugLevel` valid values: `off | minimal | full`.
- In local dev, client defaults to `debugLevel=full` unless overridden.
- `includeDebug` and `stream` are legacy-compatible bool-like fields.

## 2) Internal runtime options (normalized)

Built by `resolveRoastRuntimeOptions(...)` before pipeline execution.

```json
{
  "includeDebug": true,
  "debugLevel": "full",
  "githubTimeoutMs": 12000,
  "cfAiTimeoutMs": 30000,
  "cfAiMaxTokens": 2200,
  "cfAiTemperature": 0.55,
  "cfAiTopP": 0.92,
  "variationMode": "moderate"
}
```

## 3) GitHub collector output

### 3.1 Context used by selector/prompt

```json
{
  "username": "lafllamme",
  "commits": [
    {
      "repo": "lafllamme/grill-me",
      "sha": "fd791adeca1650622620a2a229ed5b616fd77b35",
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
          "patch": "@@ -44,25 +44,23 @@ function onSubmit() { ... [truncated]"
        }
      ]
    }
  ],
  "prs": [
    {
      "repo": "lafllamme/grill-me",
      "title": "Improve roast card",
      "url": "https://github.com/lafllamme/grill-me/pull/123",
      "state": "open"
    }
  ]
}
```

### 3.2 `debug.github` shape (`debugLevel=full`)

```json
{
  "eventsCount": 84,
  "pushEventCount": 12,
  "pullRequestEventCount": 0,
  "commitRefsFound": 12,
  "commitCandidates": 12,
  "commitEnriched": 12,
  "commitEnrichmentSkipped": 0,
  "commitRefsSample": [
    {
      "repo": "lafllamme/grill-me",
      "sha": "fd791ad"
    }
  ],
  "prSample": [],
  "contextSnapshot": {
    "commits": [
      {
        "repo": "lafllamme/grill-me",
        "sha": "fd791adeca1650622620a2a229ed5b616fd77b35",
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
            "patch": "@@ ... [truncated]"
          }
        ]
      }
    ],
    "prs": []
  }
}
```

## 4) Prompt payload contract (what AI actually sees)

This is the JSON serialized into `userPrompt`.

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
          "patch": "@@ ... [prompt-budget truncated]"
        }
      ]
    }
  ],
  "prs": []
}
```

Important:

- Yes, `files[].patch` is included in the AI payload when available.
- Patches are budgeted/truncated by:
  - `maxPromptPatchChars`
  - `maxPromptTotalPatchChars`
  - `maxPromptFilesPerCommit`
  - `maxPromptTotalFiles`

## 5) API -> Cloudflare AI payload

### 5.1 Sync generation request body

```json
{
  "model": "@cf/qwen/qwen3-30b-a3b-fp8",
  "messages": [
    {
      "role": "system",
      "content": "PromptVersion=grill-v2.0.0 ... Output strictly as JSON ..."
    },
    {
      "role": "user",
      "content": "{\"username\":\"lafllamme\",\"commits\":[...],\"prs\":[]}"
    }
  ],
  "max_tokens": 2200,
  "temperature": 0.55,
  "top_p": 0.92,
  "reasoning_effort": "low"
}
```

### 5.2 Stream generation request body

Same as sync plus:

```json
{
  "stream": true
}
```

## 6) Stream (SSE) event contract

### 6.1 `meta`

```json
{
  "type": "meta",
  "requestId": "a28ccb80",
  "username": "lafllamme"
}
```

### 6.2 `status`

```json
{
  "type": "status",
  "phase": "fetching_github",
  "message": "Fetching GitHub activity and commit diffs..."
}
```

`phase` values:

- `fetching_github`
- `selecting_evidence`
- `building_prompt`
- `calling_ai`
- `parsing_output`
- `finalizing`

### 6.3 `typing_roast` (legacy: `typing`)

```json
{
  "type": "typing_roast",
  "chunk": "- \"Your commit history reads like...\""
}
```

### 6.4 `feedback_item` (legacy: `feedback`)

```json
{
  "type": "feedback_item",
  "item": "Ship smaller diffs with one concern per commit.",
  "feedback": [
    "Ship smaller diffs with one concern per commit."
  ]
}
```

### 6.5 `debug` (`debugLevel=full` example)

```json
{
  "type": "debug",
  "debug": {
    "username": "lafllamme",
    "promptVersion": "grill-v2.0.0",
    "parserPath": "stream/chunks->lines",
    "fallbackReason": null,
    "selectionSummary": {
      "candidateCommits": 12,
      "selectedCommits": 8,
      "selectedFiles": 37,
      "selectedPatchChars": 24785
    },
    "timingsMs": {
      "githubFetch": 1610,
      "aiGenerate": 14603,
      "total": 16218
    },
    "github": {
      "eventsCount": 84,
      "pushEventCount": 12,
      "pullRequestEventCount": 0,
      "commitRefsFound": 12,
      "commitCandidates": 12,
      "commitEnriched": 12,
      "commitEnrichmentSkipped": 0,
      "commitRefsSample": [],
      "prSample": [],
      "contextSnapshot": {
        "commits": [],
        "prs": []
      }
    },
    "ai": {
      "model": "@cf/qwen/qwen3-30b-a3b-fp8",
      "maxTokens": 2200,
      "timeoutMs": 30000,
      "temperature": 0.55,
      "topP": 0.92,
      "systemPrompt": "PromptVersion=grill-v2.0.0 ...",
      "userPayload": {
        "username": "lafllamme",
        "commits": 8,
        "prs": 0,
        "payload": {
          "username": "lafllamme",
          "commits": [],
          "prs": []
        }
      },
      "responsePreview": "- \"Your code...\"",
      "responseFullText": "- \"Your code...\" FEEDBACK: ...",
      "streamCounters": {
        "status": 6,
        "typing": 0,
        "typingRoast": 187,
        "feedback": 0,
        "feedbackItem": 5,
        "debug": 1,
        "done": 1,
        "error": 0
      }
    },
    "requests": [
      {
        "stage": "github_profile",
        "url": "https://api.github.com/users/lafllamme",
        "durationMs": 269,
        "ok": true,
        "statusCode": 200
      },
      {
        "stage": "cloudflare_ai",
        "url": "https://api.cloudflare.com/client/v4/accounts/.../ai/v1/chat/completions",
        "durationMs": 696,
        "ok": true,
        "statusCode": 200
      }
    ]
  }
}
```

### 6.6 `done`

```json
{
  "type": "done",
  "data": {
    "username": "lafllamme",
    "roastLines": [
      "Line 1",
      "Line 2"
    ],
    "roast": "Line 1 Line 2",
    "feedback": [
      "Action 1",
      "Action 2",
      "Action 3"
    ],
    "meta": {
      "commitCount": 12,
      "prCount": 0,
      "selectedCommitCount": 8
    },
    "debug": {
      "username": "lafllamme",
      "timingsMs": {},
      "requests": []
    }
  }
}
```

### 6.7 `error`

```json
{
  "type": "error",
  "error": {
    "code": "cloudflare_ai_timeout",
    "message": "Cloudflare AI request timed out"
  }
}
```

## 7) Sync final response contract

Same as `done.data`:

```json
{
  "username": "lafllamme",
  "roastLines": [
    "Line 1",
    "Line 2"
  ],
  "roast": "Line 1 Line 2",
  "feedback": [
    "Action 1",
    "Action 2",
    "Action 3"
  ],
  "meta": {
    "commitCount": 12,
    "prCount": 0,
    "selectedCommitCount": 8
  },
  "debug": {
    "username": "lafllamme",
    "timingsMs": {},
    "requests": []
  }
}
```

## 8) Log-scope map (state awareness)

Use this to identify exact pipeline state while debugging:

- `client/roast/request-start`
- `client/roast/stream-meta`
- `client/roast/stream-status`
- `client/roast/stream-debug`
- `client/roast/github-context`
- `client/roast/ai-user-payload`
- `client/roast/stream-done`
- `client/roast/stream-final-raw-text`
- `client/roast/final-parsed-output`

Server:

- `server/roast/stream-request`
- `server/roast/github-collector-summary`
- `server/roast/github-collector-content`
- `server/roast/evidence-selected`
- `server/roast/prompt-built`
- `server/roast/prompt-payload-summary`
- `server/roast/prompt-payload-content`
- `server/roast/ai-user-payload`
- `server/roast/stream-raw-output`
- `server/roast/stream-counters`
- `server/roast/stream-success`
- `server/roast/failed` / `server/roast/stream-failed`

