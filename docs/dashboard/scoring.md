# Dashboard Scoring Contract

**Version:** 1.2.0
**Status:** active
**Updated:** 2026-09-02

This document owns the shared rules. Individual formulas live in
[category documents](./categories/), so a category can be changed and
validated without rewriting the entire dashboard concept.

## Shared pipeline

~~~text
category question
  → bounded GitHub evidence
  → category-owned deterministic metrics
  → bounded base score
  → grounded AI second check
  → score breakdown, evidence status, confidence
~~~

The deterministic layer owns the number. The AI may interpret visible code,
identify grounded signals, and write the explanation, but it cannot invent a
score or compensate for missing evidence.

## Five axes

| Axis | Question | Canonical formula |
| --- | --- | --- |
| Clarity | Can another developer understand the intent and local shape? | [Clarity](./categories/clarity.md) |
| Safety | What does the visible safety-relevant code protect, and do changed lines introduce concrete risks? | [Safety](./categories/safety.md) |
| Workflow | Does work arrive in understandable, reviewable slices? | [Workflow](./categories/workflow.md) |
| Complexity | Is the observed change surface controlled? | [Complexity](./categories/complexity.md) |
| Context | Does the project explain its intent and next safe change? | [Context](./categories/context.md) |

All values point in the same direction: 100 is a strong signal. Complexity
therefore means complexity control, not more complexity.

## Current implementation status

All five categories now have a deterministic score owner and one combined AI
second check. The AI never supplies a replacement number. It can only provide
grounded interpretation within the limits listed below.

| Category | Version | Numeric owner | AI influence | Current state |
| --- | --- | --- | --- | --- |
| Clarity | v3 | deterministic formula | bounded adjustment up to ±4 | calibrated |
| Safety | v4 | deterministic surface/defense formula | verified defense lift up to +8; verified introduced-risk penalty | calibrated |
| Workflow | v3 | deterministic delivery-hygiene formula | bounded adjustment up to ±4 | calibrated |
| Complexity | v2 | deterministic effective-change-surface formula | bounded adjustment up to ±4 | calibrated |
| Context | v4 | deterministic explanation/orientation formula | bounded adjustment up to ±4 | calibrated |

Safety has an explicit boundary check rather than one expected score:

| Safety probe | Observed result | Meaning |
| --- | ---: | --- |
| no patch evidence | 50 | insufficient; do not rank |
| ordinary patch | 70 | neutral; no safety claim |
| sparse defensive patch | 84 | limited positive evidence |
| fully defensive patch | 95 | strong visible defense, capped |
| medium introduced risk | 55 | grounded penalty |
| high `eval` risk | 40 | grounded high-severity penalty |
| secret/auth bypass | 20 | dedicated critical penalty |

This confirms that the current model is not fixed in the normal range. The
named six-profile run remains a calibration sample, not a reputation ranking;
its Safety values are intentionally narrower when no concrete defensive or
introduced-risk patch is visible.

## Evidence gate and neutral fallback

The public sample is bounded. If a category lacks enough category-specific
evidence for a reliable judgment, its score is 50 with an
insufficient-evidence status. This is not an average engineering grade.

Missing tests, CI, PRs, documentation, or visible patch text are not failures
by themselves. Confirmed introduced risks may still lower Safety when its
specific contract allows it. Profiles without minimum evidence stay
Unclassified instead of being force-ranked.

The general rationale is recorded in
[Neutral score for insufficient evidence](../../decisions/active/neutral-score-for-insufficient-evidence.md).

## Score ownership

The server owns:

- counting and normalization;
- score bounds (0–100);
- component contributions and evidence status;
- overall score and grade;
- role-matrix eligibility;
- chart aggregation.

The AI owns:

- semantic interpretation of selected patches and messages;
- grounded explanations for each axis;
- roast wording and constructive feedback.

For non-Safety axes, a grounded review can apply only the documented bounded
adjustment. For Safety, an independently verified defensive signal may apply a
small bounded lift, while only a verified introduced risk can apply a severity
penalty. See [AI review](./ai-review.md).

## Overall grade

~~~text
overallScore = round(mean(clarity, safety, workflow, complexity, context))
~~~

| Score | Grade | Score | Grade |
| ---: | :--- | ---: | :--- |
| 90–100 | A | 65–69 | C+ |
| 85–89 | A- | 60–64 | C |
| 80–84 | B+ | 55–59 | C- |
| 75–79 | B | 50–54 | D+ |
| 70–74 | B- | 45–49 | D |
| 40–44 | D- | 30–39 | E |
| 20–29 | E- | 0–19 | F |

The grade is not manually chosen from a role. A role describes a dominant
pattern; the grade describes the whole profile.

## Dashboard mapping

| Surface | Assessment source |
| --- | --- |
| Radar / Ring | five normalized axis scores |
| Verdict | grade, primary role, headline, AI explanation |
| Evidence | raw window totals plus axis evidence |
| Commit Frequency | factual commit count in the selected window |
| Commit Rhythm | commit distribution and size over time |
| Change Volume | additions, deletions, and churn per commit |
| Repository Anatomy | file/directory aggregation and hotspots |

No chart may create a random quality value just to fill visual space.

## Remaining work

The five formulas and their AI contracts are implemented and regression-tested.
The remaining work is calibration against more representative patch samples,
role-threshold tuning, and eventual persistence. None of those should change
the rule that missing evidence is reported as insufficient or neutral rather
than invented quality.
