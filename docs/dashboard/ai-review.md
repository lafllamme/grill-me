# Dashboard AI Review

**Version:** 1.5.0
**Status:** active
**Updated:** 2026-09-02

The dashboard makes one semantic AI request after deterministic collection and
scoring. The AI is a second layer, not a second scoring authority.

## Evidence budget

The GitHub collector remains bounded per profile:

| Evidence | Maximum |
| --- | ---: |
| candidate repositories | 5 |
| active repositories | 3 |
| history commits per repository | 12 |
| enriched commits | 18 |
| pull-request lookups | 6 |
| review lookups | 3 |
| check-run lookups | 6 |
| files per enriched commit | 8 |

The AI receives a deterministic sample of at most:

| Evidence | Maximum |
| --- | ---: |
| selected commits | 3 |
| selected files | 12 |
| characters per patch | 700 |
| total patch characters | 9,000 |
| AI output tokens | 3,200 |
| serialized request body | 96 KiB |

Selection covers the latest authored commit, a typical-sized authored commit
near the sample median, and the latest authored commit with a relevant safety
or patch signal. The typical commit avoids letting one unusually large change
dominate the semantic review. Generated, vendored, lock, and build artifacts
are excluded. Secrets are redacted before patches leave the server.

The request uses one combined prompt for all five axes with temperature 0,
top_p 0.1, and no reasoning budget. JSON Mode is not assumed for the configured
Qwen model; strict instructions, tolerant extraction, and schema validation
protect the response boundary.

## Contract

The model returns findings and axis reviews, never a numeric score:

~~~ts
interface DashboardAiReviewFinding {
  axis: 'clarity' | 'safety' | 'workflow' | 'complexity' | 'context'
  verdict: 'positive' | 'mixed' | 'negative' | 'unclear'
  impact: 'introduced' | 'fixed' | 'unclear'
  severity: 'low' | 'medium' | 'high'
  commitSha: string
  filename: string
  evidence: string
  category?: 'validation' | 'auth' | 'error-handling' | 'secrets' | 'dependency'
}

interface DashboardAiAxisReview {
  axis: 'clarity' | 'safety' | 'workflow' | 'complexity' | 'context'
  verdict: 'supports' | 'softens' | 'contradicts' | 'insufficient'
  confidence: number
  summary: string
  evidence: Array<{
    commitSha: string
    filename: string
    observation: string
  }>
}
~~~

Every accepted finding must point to an exact selected filename and commit SHA.
Every axis review also carries a short human-readable `summary`. A `supports`
review needs at least one grounded patch reference; `softens` and `contradicts`
need two distinct grounded patch references. Only `insufficient` may be empty.
Missing tests, CI, documentation, unfamiliar code, frequency, popularity, and
truncated context are not negative evidence.

### Partial response recovery

The response boundary remains strict for JSON itself: a missing/invalid
`confidence`, a response without `findings` and `axisReviews`, or a truncated
JSON object remains `invalid-response`. Once the top-level object is valid, the
parser keeps valid findings and axis reviews even if another array item is
malformed. Dropped items are reported as `parseWarnings` and reduce AI
confidence by a small bounded amount; they never create a score adjustment.
This prevents one malformed model item from hiding otherwise grounded evidence
without turning malformed output into trusted data.

The prompt asks for compact JSON, at most six findings, short summaries, and
short evidence. The server grounds every axis review again after parsing. An
ungrounded or under-evidenced review is omitted and reported as a parse warning;
it cannot appear in the UI or change a score. For Clarity, the deterministic
breakdown also includes an evidence ceiling; the server reapplies that ceiling
after the bounded AI adjustment, so a thin sample cannot be upgraded into an
exceptional score.

For Safety, only verdict negative plus impact introduced can enter the
confirmed-risk path, and the server independently verifies the pattern. A
positive Safety finding can add at most eight points only when it names a
grounded commit and file and the server confirms a defensive pattern in the
added lines. Fixed and unclear findings never lower Safety. For other axes,
softens or contradicts may change the deterministic score by at most 4 points
only with confidence ≥70 and two grounded patch references.

## Status semantics

| Status | Meaning |
| --- | --- |
| assessed | response parsed and grounded findings retained |
| not-configured | AI credentials missing; deterministic scores remain |
| no-evidence | no usable authored patch was available |
| unavailable | upstream AI request failed; deterministic scores remain |
| invalid-response | response violated the contract; deterministic scores remain |

The API exposes selected evidence, collection counts, AI status, and the
grounded axis reviews. The Profile panel renders the deterministic Clarity
signals and cap next to the AI summary and the exact patch filenames, so a
reader can distinguish the number from the explanation that supports it.

## Implementation

- Collector: server/roast/github-collector.ts
- Patch sampler: server/roast/dashboard-patch-selection.ts
- Combined request: server/roast/dashboard-ai-scoring.ts
- Score application: server/roast/dashboard-profile-scoring.ts
- API boundary: server/api/dashboard-profile.post.ts

The browser does not render the internal debug panel. With
NUXT_ROAST_DEBUG=true, the server emits one summary record containing timing,
counts, derived metrics, scores, grade, role, AI status, selected patch counts,
and accepted Safety risks, without patch contents or secrets.
