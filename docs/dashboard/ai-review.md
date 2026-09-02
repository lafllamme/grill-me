# Dashboard AI review

**Version:** 1.5.0
**Status:** active
**Updated:** 2026-09-03

The dashboard makes one semantic AI request after deterministic GitHub
collection and scoring. The AI is a grounded second reviewer, not a scoring
authority.

## Budget

| Resource | Limit |
| --- | ---: |
| enriched commits from GitHub | 18 |
| selected commits for AI | 3 |
| selected files | 12 |
| characters per patch | 700 |
| total patch characters | 9,000 |
| output tokens | 3,200 |
| serialized request body | 96 KiB |

Selection is deterministic: latest authored commit, a typical-sized authored
commit, and the latest relevant commit. Generated, vendored, lock, and build
artifacts are excluded. Secrets are redacted before patches leave the server.

## Contract

The model returns compact axis reviews and grounded findings with exact commit
SHA and filename references. It returns no score, grade, rank, or role. The
complete types, prompt, parser, grounding, and bounded adjustments are in
[`server/roast/dashboard/ai-review/`](../../server/roast/dashboard/ai-review/).

Every accepted review must satisfy the grounding rules in the feature README.
An under-evidenced, malformed, or ungrounded item is omitted and reported as
a warning; it cannot reach the UI or change a score. Missing tests, CI, PRs,
documentation, unfamiliar code, popularity, and truncated context are not
negative evidence.

Safety is stricter: only a `risk` finding with `impact: introduced`, known
commit evidence, and a server-confirmed added-line pattern can subtract. A
verified defensive signal may provide only the documented bounded lift.

## Statuses

`assessed`, `not-configured`, `no-evidence`, `unavailable`, and
`invalid-response` are distinct API states. All fallback states preserve the
deterministic scores.

## Integration

- bounded sampler: [`patch-selection/`](../../server/roast/dashboard/patch-selection/)
- combined request: [`ai-review/service.ts`](../../server/roast/dashboard/ai-review/service.ts)
- score composition: [`profile-scoring.ts`](../../server/roast/dashboard/profile-scoring.ts)
- API boundary: [`dashboard-profile.post.ts`](../../server/api/dashboard-profile.post.ts)

The public response, JSON schema, SSE events, Cloudflare limits, and score
values remain unchanged by the folder migration. The former flat AI file is a
compatibility facade.
