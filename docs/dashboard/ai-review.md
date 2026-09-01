# Dashboard AI Review

**Version:** 1.0.0
**Status:** active
**Updated:** 2026-09-01

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

Selection covers the latest authored commit, the largest authored commit, and
the latest commit with a relevant safety or patch signal. Generated, vendored,
lock, and build artifacts are excluded. Secrets are redacted before patches
leave the server.

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
  evidence: Array<{
    commitSha: string
    filename: string
    observation: string
  }>
}
~~~

Every accepted finding must point to an exact selected filename and commit SHA.
Missing tests, CI, documentation, unfamiliar code, frequency, popularity, and
truncated context are not negative evidence.

For Safety, only verdict negative plus impact introduced can enter the
confirmed-risk path, and the server independently verifies the pattern. Fixed
and unclear findings never lower Safety. For other axes, softens or
contradicts may change the deterministic score by at most 4 points only with
confidence ≥70 and two grounded patch references.

## Status semantics

| Status | Meaning |
| --- | --- |
| assessed | response parsed and grounded findings retained |
| not-configured | AI credentials missing; deterministic scores remain |
| no-evidence | no usable authored patch was available |
| unavailable | upstream AI request failed; deterministic scores remain |
| invalid-response | response violated the contract; deterministic scores remain |

The API exposes selected evidence, collection counts, and AI status so the UI
can distinguish a measured score from a neutral score.

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
