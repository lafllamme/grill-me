# Context Scoring

**Version:** 5.0.0
**Status:** calibrated
**Updated:** 2026-09-02

## Question

Does the sampled work explain itself and leave enough orientation for the next
safe change?

Context measures the explanation and orientation surface around a change. It
is deliberately separate from Clarity: readable names and local structure
belong to Clarity, while Context asks whether the next contributor can
understand why the change exists and where to continue.

## Deterministic formula

~~~text
Context = 70
        + (patchExplanationSignal - 50)    * 0.22
        + (orientationArtifactSignal - 50) * 0.10
        + (commitContextSignal - 50)       * 0.28
        + (repositoryOrientation - 50)    * 0.05
        + (handoffSignal - 50)             * 0.05
~~~

All signals are clamped to 0–100. The score requires at least three sampled
commits and three personal non-merge commits. Otherwise it returns 50 with
insufficient evidence. With enough evidence, 70 is the neutral midpoint:
missing context evidence is not treated as a defect and does not quietly push
an otherwise credible profile into the low 60s. Direct patch explanations and
commit context drive 50% of the movement around neutral. Orientation files,
repository metadata, and handoff metadata are deliberately weak proxies and
contribute 20% together. A generic or empty commit subject is direct negative
context evidence; it can lower the score, while missing docs or comments alone
cannot.

### Signals

| Signal | Derivation | Purpose |
| --- | --- | --- |
| `patchExplanationSignal` | `50 + explanatoryAddedLineRatio * 40` for added comments/docstrings in visible non-documentation patches | Detects explanations attached to the changed code, not comments guessed from filenames |
| `orientationArtifactSignal` | `50 + min(weightedOrientationFiles / visiblePatchFiles, 1) * 40` | Rewards visible README, CONTRIBUTING, docs, examples, architecture, or ADR changes |
| `commitContextSignal` | Per personal commit: start at 50; subtract 20 for an empty subject or 15 for a generic subject; add 15 for a specific three-word subject with an action, 15 for a meaningful body, and 10 for explicit rationale or references; then average and clamp | Measures what/why context without rewarding Conventional Commit syntax alone |
| `repositoryOrientation` | `50 + min(orientationEntryWeight * 8, 30)` from root entries only | Weakly recognizes orientation affordances already present in the repository |
| `handoffSignal` | `50 + pullRequestCoverage * 0.20 + reviewedPullRequestRatio * 20` when PR evidence exists; otherwise 50 | Adds a small review/handoff signal without treating PR count as documentation quality |

Orientation artifact weights are `1.0` for README or CONTRIBUTING, `0.8` for
docs/documentation, and `0.6` for examples, architecture, or ADR entries.
Generated changelogs and release notes have weight zero. A repository root
entry is only weak metadata; it does not prove that the artifact is useful.

Missing comments, documentation, examples, PRs, or patch text are neutral. A
limited public sample cannot prove that an artifact does not exist elsewhere,
so Context does not punish absence by itself. Conventional Commit syntax alone
does not count as context; a subject must also describe a concrete action and
object. Generic subjects such as `update`, `stuff`, or `wip` remain at 50.

### Interpretation bands

| Score | Meaning |
| ---: | --- |
| 50 | insufficient evidence; do not classify the profile |
| 60–69 | weak visible context, usually driven by vague or empty subjects |
| 70–76 | neutral/usable sampled context; missing artifacts are not a penalty |
| 77–85 | good visible context across multiple evidence types |
| 86–94 | very strong context with broad, consistent evidence |
| 95 | exceptional sampled evidence; capped and never inferred from seniority or commit volume |

## AI second check

The single combined AI request receives the same bounded patch sample and the
Context breakdown. It is asked to inspect actual explanatory additions,
orientation artifacts, examples, commit intent, and visible handoff evidence.
It must not infer a negative result from missing documentation, missing PRs,
repository size, popularity, commit volume, or truncated patches.

The AI cannot replace the deterministic score. A grounded axis review needs
confidence ≥70 and two distinct patch references before the server accepts a
bounded adjustment of at most ±4. A support or insufficient review changes
nothing; a softening or contradicting review is ignored unless its references
are grounded in the selected patches.

## Validation

| Scenario | Expected |
| --- | --- |
| visible code explanations, orientation artifacts, and reviewed PRs | above 75 when the signals are broad and consistent |
| normal feature patches with no explanation evidence | around neutral 70–76, not an automatic failure |
| vague commits with no visible context | around 60–69 because generic subjects are direct evidence |
| generated changelog-only work | neutral 70; release artifacts are not orientation proof |
| root README exists but no relevant patch is visible | only a small lift from repository orientation |
| fewer than three personal commits | neutral 50 because evidence is insufficient |

## Known limits

GitHub exposes only a bounded set of commit files and truncated patch hunks.
The repository orientation signal sees only a root-entry snapshot, and PR data
does not include the complete discussion. Context is therefore an evidence
score for the sampled change window, not a claim that the whole repository is
documented or that the developer communicates well in every project.

## Implementation and tests

- Formula and breakdown: `server/roast/dashboard-profile-scoring.ts`
- AI baseline wiring: `server/roast/dashboard-profile-service.ts`
- AI contract: `server/roast/dashboard-ai-scoring.ts`
- Regression coverage: `tests/unit/dashboard-profile-scoring.test.ts`
