# Dashboard Scoring Contract

**Version:** 1.0.0
**Status:** active
**Updated:** 2026-09-01

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
| Safety | Do changed lines visibly introduce concrete safety risks? | [Safety](./categories/safety.md) |
| Workflow | Does work arrive in understandable, reviewable slices? | [Workflow](./categories/workflow.md) |
| Complexity | Is the observed change surface controlled? | [Complexity](./categories/complexity.md) |
| Context | Does the project explain its intent and next safe change? | [Context](./categories/context.md) |

All values point in the same direction: 100 is a strong signal. Complexity
therefore means complexity control, not more complexity.

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
adjustment. For Safety, only an independently verified introduced risk can
apply a severity penalty. See [AI review](./ai-review.md).

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
