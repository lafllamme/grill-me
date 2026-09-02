# Safety Scoring

**Version:** 4.0.0
**Status:** calibrated
**Updated:** 2026-09-02

## Question

What does the visible safety-relevant code protect, and do the supplied changed
lines introduce a concrete validation, authorization, error-handling, secret,
or dependency risk?

Safety is not a repository reputation score. A deliberately vulnerable training
repository can have excellent workflow and documentation practices.

## Deterministic formula

~~~text
patchCoverageMultiplier = 0.5 + (safetyPatchCommitRatio / 100) * 0.5

if no personal patch evidence:
  Safety = 50 / insufficient

if no safety surface is visible:
  Safety = 70 / neutral

  otherwise:
    Safety = 70
    + safetyDefenseCoverage * 0.25 * patchCoverageMultiplier
    + processBonus
    + aiDefenseBonus * patchCoverageMultiplier
    - confirmedRiskPenalty
~~~

`processBonus = min(5, validationFileRatio * 0.03 + ciFileRatio * 0.02)`.
`aiDefenseBonus` is produced only from grounded, server-verified safe findings
and is capped at eight before patch-coverage scaling.

The result is clamped to 0–100. The formula separates three states instead of
calling every patch-backed sample equally safe:

- `50 / insufficient`: no personal patch can be inspected.
- `70 / neutral`: patches exist, but none visibly touches a safety surface.
- `70–95 / surface-observed`: the sample changes auth, validation, input,
  error-handling, serialization, database, command, secret, or similar code;
  the score then depends on visible defensive coverage.

`safetySurfaceFileRatio` and `safetySurfaceLineRatio` describe how much of the
visible patch touches that surface. `safetyDefenseCoverage` blends the ratio of
surface files with a defensive signal and the ratio of defensive added lines.
This makes the score code-dependent without treating a normal UI change as
evidence of security expertise. A visible surface without a detected guard is
not automatically a vulnerability and stays at the neutral baseline until the
code or the AI review supplies stronger positive or negative evidence.

`processBonus` is capped at five points and only applies when a safety surface
is present. It uses validation-file and CI-file presence as weak corroboration;
tests, PRs, commit frequency, and repository size do not create a Safety bonus.
`defensivePatchRatio` and `riskyPatchRatio` remain diagnostic compatibility
metrics. `safetyPatchCommitRatio` limits how much a small visible patch sample
can represent the personal commit window.

Only confirmed introduced risks are penalized:

| Severity | Penalty |
| --- | ---: |
| low | -5 |
| medium | -15 |
| high | -30 |
| high secret or auth bypass | -50 |

The server verifies the signal against the supplied patch. riskyFileRatio and
riskyPatchRatio remain context metrics; they are not penalties by themselves.

## AI contract

The AI receives at most three deterministic commits from the same bounded
GitHub collection: the latest authored commit, a typical-sized authored commit
near the sample median, and the latest commit with a relevant Safety file or
patch signal. The typical commit replaces the largest commit so one outlier
does not dominate the second check. Its Safety response is:

~~~ts
{
  confidence: number
  signals: [{
    category: 'validation' | 'auth' | 'error-handling' | 'secrets' | 'dependency'
    verdict: 'safe' | 'risk' | 'unclear'
    impact: 'introduced' | 'fixed' | 'unclear'
    severity: 'low' | 'medium' | 'high'
    commitSha: string
    filename?: string
    evidence: string
  }]
}
~~~

Only risk + introduced, with a known commit SHA, non-empty evidence, and a
confirmed patch pattern, can lower Safety. A safe finding may provide a bounded
positive lift of at most eight points, but only when the AI points to a known
commit and filename and the server independently confirms a defensive pattern
in the added lines. Fixed, unclear, removed, or unverified findings never
lower Safety; a verified fix may receive the same small positive lift.

## Repository-backed negative controls

The controls are repository-scoped immutable commits, not username scores:

| Source commit | Visible introduced risk | Patch result |
| --- | --- | ---: |
| [OWASP/NodeGoat@c28fd67](https://github.com/OWASP/NodeGoat/commit/c28fd67dbc7f44a22fbaa50cf952150de9a69eea) | request values passed to eval | 40 |
| [digininja/DVWA@a2c13e5](https://github.com/digininja/DVWA/commit/a2c13e53ba949b3bc991068781682b4d7185f3b8) | password assignment in an auth check | 20 |
| [OWASP-Benchmark@32933c4](https://github.com/OWASP-Benchmark/BenchmarkJava/commit/32933c4e6edfa00e0e3123f6ec54c9ac286950ba) | hard-coded Sonar password | 20 |

These are deliberately clear negative controls. They prove that grounded
introduced risks reach the configured penalty path. They do not prove how a
complete repository aggregates risk; that needs a repository-scoped evidence
pack with multiple commits.

The exact compact excerpts and paired fix controls are in
[tests/fixtures/dashboard-safety-probes.ts](../../../tests/fixtures/dashboard-safety-probes.ts).
The focused suite is
[tests/unit/dashboard-profile-scoring.test.ts](../../../tests/unit/dashboard-profile-scoring.test.ts).

The collector can enrich up to 18 personal commits, while the AI sees at most
three selected commits and 9,000 patch characters. This is intentional: the
deterministic layer uses the complete bounded sample for coverage, and the AI
uses a stratified semantic check without expanding the Cloudflare request.

## Role boundaries

- Edge-Case Sheriff: Safety ≥85
- Risk Runner: Safety 40–60
- Finger Crosser: Safety ≤35

Profiles without minimum evidence remain Unclassified.

## Validation

| Scenario | Expected |
| --- | --- |
| defensive patch in a fully patch-backed sample | 85+ before AI; up to 95 with grounded defense evidence |
| one defensive patch in a sparse sample | a smaller lift than the same patch with full coverage |
| ordinary patch with no visible Safety surface | neutral 70 when patch evidence exists |
| Safety surface without a visible guard | neutral 70, not an automatic vulnerability |
| fixed or unclear AI finding | no penalty |
| confirmed introduced risk | severity penalty only after server-side verification |
| no personal patch evidence | insufficient-evidence 50 |

The v3 sparse-coverage control is in
[tests/unit/dashboard-profile-scoring.test.ts](../../../tests/unit/dashboard-profile-scoring.test.ts).

## Known limits

These probes validate the Safety contract, not the quality of an author or
repository. A username run can remain neutral when its selected patches do not
show a Safety surface, or observed-range when they touch one without enough
defensive evidence. More evidence improves confidence; absence of a visible
safeguard is not itself a confirmed vulnerability.
