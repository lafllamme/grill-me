# Dashboard module

**Status:** active
**Updated:** 2026-09-03

This folder owns the dashboard analysis from bounded GitHub evidence to the
final profile response. `index.ts` is the only public server entry point. The
API response, SSE events, scoring formulas, and Cloudflare request contract do
not change when the internals are reorganized.

## Ownership

| Module | Responsibility |
| --- | --- |
| `analysis.ts` | GitHub → deterministic scoring → one AI review → final assessment |
| `scoring.ts` | Compose the five category scores, grade, confidence, and role |
| `evidence.ts` | Convert collected GitHub context into the public evidence shape |
| `categories/` | Category-owned metrics, formulas, patterns, AI questions, and tests |
| `ai-review/` | Prompt, parser, grounding, and bounded AI adjustments |
| `patch-selection/` | Deterministic patch sample and payload budget |
| `roles/` | Profile role matrix and resolver |
| `shared/` | Pure cross-category helpers |

The shared trace implementation lives in
[`shared/dashboard/trace.ts`](../../../shared/dashboard/trace.ts), because the
same typed logger is used by the server analysis and the client stream
consumer. The provider transport in `../ai-client.ts` and the generic server
sink in `../debug.ts` remain outside this folder because normal Roast uses them
too.

## Analysis sequence

```text
request
  → bounded GitHub collection
  → public evidence becomes available
  → deterministic metrics and five baseline scores
  → deterministic three-commit patch selection
  → one combined AI review
  → grounded, bounded adjustments
  → final grade, role, evidence, and dashboard response
```

There is one AI request per analysis. The client does not start requests per
chart and does not render the temporary deterministic score while the AI
review is still in flight.

## Trace logging

Tracing is controlled by `NUXT_DASHBOARD_TRACE_LEVEL` on the server and
`NUXT_PUBLIC_DASHBOARD_TRACE_LEVEL` in the browser:

| Level | Behavior |
| --- | --- |
| `off` | No dashboard trace output |
| `summary` | Phase, counts, timings, sizes, score summary, and parser state |
| `full` | Summary plus exact prompts and model text; server/local use only |

Development defaults to `summary`; production defaults to `off`. `full` must
never be enabled for a shared or production environment. The normal client
trace is limited to lifecycle and stream events even when server-side full
tracing is enabled.

In development, each server analysis is also saved as a local Markdown file
under `logs/dashboard/` by default. Set
`NUXT_DASHBOARD_TRACE_FILE_DIR=` to disable it or choose another local
directory. The file has the same request id as the terminal output and keeps
the same redaction rules: `summary` stores sizes only, while `full` stores the
prompt and model response in separate readable sections. The `logs/` folder
is ignored by Git and must not be used as a production log sink.

### Where the logs appear

- Server phases (`GitHub`, `Grill`, and `AI`) appear in the terminal running
  `pnpm dev`.
- Client stream phases (`UI` and forwarded `GitHub` progress) appear in the
  browser DevTools Console.
- Server trace files appear in `logs/dashboard/` after the request finishes.
- Trace entries are developer diagnostics; they are not rendered in the
  product UI.

Use `NUXT_DASHBOARD_TRACE_LEVEL=full pnpm dev` for the local server-only view
of the exact AI prompt and model response. Summary mode is the safe default and
shows sizes and token estimates without exposing patch contents.

The log prefixes identify the owner of each event. Every line includes the
short phase description, profile, request id, source (`server` or `client`),
and elapsed time. Collection and patch-selection events also print the
selected commit/file lists; prompt and response events print only sizes in
`summary` and open a readable `consola` box in `full`:

```text
[GitHub] update collection · lafllamme · bcf2d4cb · server · +513ms
  phase: commits · enrich commit patches
  repositories: 3
  commits: 18
[Grill] calculate baseline · lafllamme · bcf2d4cb · server · +642ms
  scores: clarity=95 · safety=78 · workflow=72 · complexity=64 · context=74
  overall score: 77
  metrics:
    commit count: 18
[AI] prepare AI review · lafllamme · bcf2d4cb · server · +644ms
  selected commits: 3 · selected files: 12 · patch characters: 7383
  system prompt: hidden · 4939 chars · 4939 bytes · ≈1235 tokens
  user prompt: hidden · 13866 chars · 13866 bytes · ≈3467 tokens
[AI] finish AI review · lafllamme · bcf2d4cb · server · +2201ms
  status: assessed · response path: choices[0].message.reasoning
  confidence: 60 · axis reviews: 5 · findings: 0
[Grill] publish final profile · lafllamme · bcf2d4cb · server · +2204ms
  overall score: 77 · grade: B · role: Unclassified
[UI] complete dashboard stream · lafllamme · bcf2d4cb · client · +2210ms
  overall score: 77 · grade: B · role: Unclassified
```

At `full`, `[AI] prepare AI review` is followed by a boxed view with
`SYSTEM PROMPT` and `USER PROMPT / METRICS`. `[AI] receive AI response` is
followed by a second box containing the model text and the actual parser
path. This makes a reasoning fallback visible instead of incorrectly
reporting `parserPath: none`.

Every entry is request-scoped and contains `requestId`, username, source, and
elapsed time. The AI transport reports the serialized Cloudflare request body
size, prompt character counts, and an input-token estimate. If Cloudflare
returns provider usage in a future transport update, that actual usage can be
added alongside the estimate; the application does not invent token costs or
“neuron” counts.

### Redaction

Summary tracing never prints prompt text, patch bodies, code changes, or raw
model output. It replaces those values with character, byte, and estimated
token counts. Full tracing is explicit and local-only. GitHub patch redaction
still happens before patches reach the AI prompt and is independent of trace
logging.

## Cleanup policy

The former flat dashboard modules were removed after the internal import and
documentation audit. New server code imports from `server/roast/dashboard` or
one of its owning subfolders. No database migration, API migration, or public
contract change is part of this cleanup.

## Validation

The migration is accepted only when these checks pass:

```text
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:e2e
git diff --check
```

The dashboard tests must continue to cover the six named profiles, synthetic
positive and negative probes, the one-request AI contract, patch grounding,
trace redaction, and the final streamed UI response.
