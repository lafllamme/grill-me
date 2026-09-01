# Safety Scoring

**Version:** 1.0.0
**Status:** calibrated
**Updated:** 2026-09-02

## Question

Do the supplied changed lines visibly introduce a concrete validation,
authorization, error-handling, secret, or dependency risk?

Safety is not a repository reputation score. A deliberately vulnerable training
repository can have excellent workflow and documentation practices.

## Deterministic formula

~~~text
Safety = 65
  + defensivePatchRatio * 0.20
  + testFileRatio * 0.15
  + ciFileRatio * 0.15
  + validationFileRatio * 0.10
  + pullRequestCoverage * 0.10
  - confirmedRiskPenalty
~~~

The result is clamped to 0–100. Missing tests, CI, PRs, or patch excerpts do
not automatically lower the score. If no personal patch evidence exists, the
category returns neutral 50.

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

The AI receives at most three deterministic commits: the latest authored
commit, the largest authored commit, and the latest commit with a relevant
Safety file or patch signal. Its Safety response is:

~~~ts
{
  confidence: number
  signals: [{
    category: 'validation' | 'auth' | 'error-handling' | 'secrets' | 'dependency'
    verdict: 'safe' | 'risk' | 'unclear'
    impact: 'introduced' | 'fixed' | 'unclear'
    severity: 'low' | 'medium' | 'high'
    commitSha: string
    evidence: string
  }]
}
~~~

Only risk + introduced, with a known commit SHA, non-empty evidence, and a
confirmed patch pattern, can lower Safety. Fixed, safe, unclear, removed, or
unverified findings never lower it.

## Repository-backed negative controls

The controls are repository-scoped immutable commits, not username scores:

| Source commit | Visible introduced risk | Patch result |
| --- | --- | ---: |
| [OWASP/NodeGoat@c28fd67](https://github.com/OWASP/NodeGoat/commit/c28fd67dbc7f44a22fbaa50cf952150de9a69eea) | request values passed to eval | 35 |
| [digininja/DVWA@a2c13e5](https://github.com/digininja/DVWA/commit/a2c13e53ba949b3bc991068781682b4d7185f3b8) | password assignment in an auth check | 15 |
| [OWASP-Benchmark@32933c4](https://github.com/OWASP-Benchmark/BenchmarkJava/commit/32933c4e6edfa00e0e3123f6ec54c9ac286950ba) | hard-coded Sonar password | 15 |

These are deliberately clear negative controls. They prove that grounded
introduced risks reach the configured penalty path. They do not prove how a
complete repository aggregates risk; that needs a repository-scoped evidence
pack with multiple commits.

The exact compact excerpts and paired fix controls are in
[tests/fixtures/dashboard-safety-probes.ts](../../../tests/fixtures/dashboard-safety-probes.ts).
The focused suite is
[tests/unit/dashboard-profile-scoring.test.ts](../../../tests/unit/dashboard-profile-scoring.test.ts).

## Role boundaries

- Edge-Case Sheriff: Safety ≥85
- Risk Runner: Safety 40–60
- Finger Crosser: Safety ≤35

Profiles without minimum evidence remain Unclassified.

## Known limits

These probes validate the Safety contract, not the quality of an author or
repository. A username run can remain in the normal range when its selected
patches do not show a concrete risk. More evidence improves confidence; absence
of a visible safeguard is not itself a vulnerability.
