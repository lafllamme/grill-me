# Dashboard Scoring History

**Status:** calibration record
**Updated:** 2026-09-02

This file contains calibration evidence that should not be mixed into the
active formula contract. The values describe a bounded public sample, not a
general ranking of the named developers.

## Safety v4 live probe

This run tested the surface-aware formula after the first probe exposed an
important issue: starting every detected Safety surface at 60 treated missing
positive evidence like a hidden penalty. Safety v4 keeps a patch-backed sample
at the neutral 70 baseline unless visible defensive code or a confirmed risk
changes the result. The AI review returned no accepted positive defense or
introduced-risk findings in this run.

| Profile | Safety v4 | Surface files | Surface lines | Defense coverage | AI defense bonus | AI status | Interpretation |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| lafllamme | 73 | 8% | 4% | 13% | 0 | assessed | small visible defensive surface; no confirmed risk |
| danielroe | 70 | 14% | 2% | 0% | 0 | assessed | safety surface present, but no verified defense or risk in the sample |
| torvalds | 70 | 18% | 15% | 0% | 0 | assessed | relevant code was visible, but absence of a guard was not treated as failure |
| sindresorhus | 70 | 2% | 0% | 0% | 0 | assessed | nearly neutral patch-backed Safety evidence |
| antfu | 76 | 9% | 2% | 25% | 0 | assessed | modest deterministic defensive signal |
| kentcdodds | 76 | 24% | 12% | 25% | 0 | assessed | modest defensive signal across the visible surface |

The first v4 probe was intentionally used as a correction pass. It confirmed
that the surface detector is useful for explaining what was inspected, but it
must not lower Safety merely because a selected patch did not contain a guard.
The synthetic controls remain the separation test: fully defensive patches cap
at 95, while grounded high-severity risks retain their configured penalties.

## Safety v3 live probe

This run exercised Safety v3 against the fixed six-profile regression set. The
server used all visible personal patches for deterministic coverage, while the
single AI request inspected a stratified sample of the latest, typical-sized,
and Safety-relevant commits. Every profile had full patch coverage in this
run, so the coverage multiplier was 1.0. No AI response contained a grounded
introduced-risk signal that passed the server verification step.

| Profile | Safety v3 | Patch coverage | Defensive patches | Risky patches | Validation files | CI files | AI status | AI commits / patches | Interpretation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | --- |
| lafllamme | 60 | 100% | 1% | 0% | 0% | 0% | assessed | 3 / 12 | mostly neutral visible Safety evidence; no introduced risk |
| danielroe | 60 | 100% | 0% | 0% | 0% | 3% | assessed | 3 / 9 | CI is only a weak corroborator; no concrete patch risk |
| torvalds | 61 | 100% | 0% | 0% | 13% | 0% | assessed | 3 / 10 | validation-file presence adds only a small corroborating lift |
| sindresorhus | 60 | 100% | 1% | 0% | 0% | 0% | assessed | 3 / 9 | test volume stays diagnostic and does not inflate Safety |
| antfu | 61 | 100% | 2% | 0% | 0% | 3% | assessed | 3 / 10 | small defensive/CI corroboration, no confirmed risk |
| kentcdodds | 61 | 100% | 5% | 0% | 2% | 1% | assessed | 3 / 12 | modest visible defensive signal, no introduced risk |

The clustered values are expected for this sample: v3 is a concrete Safety
score, not an overall engineering ranking. Patch coverage prevents sparse
evidence from receiving the full defensive bonus, while missing safeguards do
not become invented vulnerabilities. The synthetic sparse-coverage control
and repository-backed risk probes remain the tests for score separation.

## Safety v3.1 live probe

This rerun changed only the patch-backed Safety baseline from 60 to 70. The
coverage multiplier, added-line signals, AI sample selection, and risk
penalties stayed unchanged. The purpose was to test whether a patch-backed
sample without a confirmed introduced risk was being presented too negatively.

| Profile | Safety v3.1 | Safety v3 | Δ | Defensive patches | Validation files | CI files | AI status | Introduced risks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: |
| lafllamme | 70 | 60 | +10 | 1% | 0% | 0% | assessed | 0 |
| danielroe | 70 | 60 | +10 | 0% | 0% | 3% | assessed | 0 |
| torvalds | 71 | 61 | +10 | 0% | 13% | 0% | assessed | 0 |
| sindresorhus | 70 | 60 | +10 | 1% | 0% | 0% | assessed | 0 |
| antfu | 71 | 61 | +10 | 2% | 0% | 3% | assessed | 0 |
| kentcdodds | 71 | 61 | +10 | 5% | 2% | 1% | assessed | 0 |

The calibration is better for the product meaning: no profile is labelled
unsafe or mediocre merely because its bounded public sample lacks a defensive
patch. The narrow spread is still correct for Safety alone; role separation
must use the complete five-axis profile and concrete negative controls, not
manufactured Safety differences.

## Safety v2 live probe

This run exercised the patch-centred Safety v2 formula against the fixed six
public profiles. The same endpoint first produced a v1 reference, then the v2
result after the local formula change. The samples were fetched close
together, but GitHub's public window can still change between requests. No
profile produced an accepted introduced-risk signal in the AI second review.

| Profile | v1 reference | v2 Safety | Defensive patches | Validation files | CI files | Test files | PR coverage | AI status | Interpretation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| lafllamme | 66 | 60 | 1% | 0% | 0% | 5% | 0% | assessed | patch-backed but no visible defensive addition in the sample |
| danielroe | 72 | 62 | 0% | 0% | 40% | 0% | 6% | assessed | CI is only a weak corroborator; tests/PRs no longer inflate Safety |
| torvalds | 66 | 61 | 0% | 13% | 0% | 0% | 0% | assessed | no confirmed risk and no direct defensive patch in the bounded sample |
| sindresorhus | 69 | 61 | 4% | 0% | 0% | 19% | 0% | assessed | small visible defensive signal, but no broad safety claim |
| antfu | 67 | 61 | 2% | 0% | 3% | 8% | 0% | assessed | neutral patch sample with only weak corroboration |
| kentcdodds | 74 | 62 | 8% | 2% | 1% | 27% | 33% | assessed | visible defensive signal contributes modestly; process metadata stays diagnostic |

The v1 values were driven partly by test-file and PR ratios. v2 removes those
rewards and starts patch-backed evidence at neutral 60. This is a better
Safety ranking for the question being asked, but it is not a ranking of
engineering ability: a strong developer can have no safety-shaped patch in a
small public sample. The controlled negative probes remain the stronger proof
that confirmed introduced risks receive the configured penalties.

## Workflow v3 live probe

This run was made against the live dashboard endpoint after the evidence-cap
change. The AI was still one combined second review; it could change Workflow
by at most four points only when its patch references were grounded.

| Profile | Workflow | Personal commits | Patch commits | AI adjustment | AI status | Interpretation |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| lafllamme | 92 | 17 | 17 | +4 | assessed | broad sample, AI found the delivery pattern coherent |
| danielroe | 90 | 18 | 18 | 0 | invalid-response | focused scope; deterministic result kept |
| torvalds | 86 | 11 | 11 | +4 | assessed | merge-heavy public history, but personal sample is now usable |
| sindresorhus | 75 | 18 | 18 | 0 | invalid-response | broad package/release work and weaker message signal |
| antfu | 90 | 18 | 18 | 0 | assessed | focused scope and consistent intent |
| kentcdodds | 57 | 18 | 18 | 0 | invalid-response | broad personal scope and weak delivery-intent signal |

The live values are not a ranking of engineering ability. They describe the
observable delivery pattern in the bounded public sample. The new cap did not
need to lower these particular runs because they had enough personal and patch
evidence; its behavior is covered by the limited-sample unit tests.

## Workflow v3 post parser-fix probe

The same six-profile probe set was rerun after the combined AI response parser
was made tolerant of malformed individual items. All six responses were
`assessed`; none fell back to `invalid-response`.

| Profile | Workflow | Personal commits | Patch commits | AI adjustment | AI status | Interpretation |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| lafllamme | 88 | 17 | 17 | 0 | assessed | broad but understandable delivery sample |
| danielroe | 95 | 18 | 18 | 0 | assessed | strongest focused delivery signal in this run |
| torvalds | 82 | 11 | 11 | 0 | assessed | personal commits separated from merge-heavy history |
| sindresorhus | 79 | 18 | 18 | 0 | assessed | broad package/release work remains mid-range |
| antfu | 94 | 18 | 18 | +4 | assessed | AI found the sampled changes consistently focused |
| kentcdodds | 57 | 18 | 18 | 0 | assessed | broad delivery slices and weaker message signal |

The Kent retry returned a grounded `supports` review at 75% axis confidence,
so the 57 remained unchanged. This validates the AI response path; it does not
turn the bounded Workflow sample into a general engineering ranking.

## Clarity v2 live probe

This run exercised the new Clarity formula against the same six public profiles.
The server used visible added patch lines for naming and local structure, while
the combined AI review was limited to a second check. A missing signal means
that the selected patch sample did not expose the relevant code shape; it was
kept neutral at 50 rather than treated as a failure.

| Profile | Clarity | Message | Conventional | Naming | Structure | AI adjustment | AI status | Interpretation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| lafllamme | 98 | 95 | 100 | 100 | 98 | 0 | assessed | strong intent and clear visible patch structure |
| danielroe | 86 | 96 | 100 | 50* | 99 | 0 | assessed | strong intent and structure; no declaration signal in the selected patches |
| torvalds | 72 | 68 | 0 | 100 | 93 | 0 | invalid-response | clear visible names/structure, weaker sampled intent metadata |
| sindresorhus | 74 | 70 | 0 | 100 | 96 | 0 | assessed | strong patch signals, weaker sampled intent metadata |
| antfu | 94 | 88 | 100 | 100 | 94 | 0 | assessed | consistently strong intent and visible patch signals |
| kentcdodds | 72 | 68 | 0 | 100 | 93 | 0 | assessed | clear visible structure, weaker sampled intent metadata |

\* `50` is the neutral naming fallback because the selected patch sample did
not contain a declaration that the heuristic could inspect. These values are
calibration evidence for a bounded public sample, not engineering rankings.
The AI returned `supports` for the assessed Clarity reviews, so no ±4
adjustment was eligible. Torvalds' invalid AI response also left the
deterministic score untouched.

## Clarity v3 live probe

Clarity v3 removes Conventional Commit syntax from the score because it is a
Workflow signal. The run below uses the fixed six-profile regression set and
the visible patch sample returned at run time. Patch selection can change as
GitHub history changes, so this remains calibration evidence rather than a
ranking.

| Profile | Clarity | Message | Conventional* | Naming | Structure | AI adjustment | AI status | Interpretation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| lafllamme | 98 | 95 | 100 | 100 | 98 | 0 | assessed | strong intent and clear visible patch structure |
| danielroe | 98 | 96 | 100 | 100 | 98 | 0 | assessed | strong intent, names, and visible patch structure |
| torvalds | 86 | 68 | 0 | 100 | 93 | 0 | assessed | strong visible patch clarity; message syntax no longer drags it down |
| sindresorhus | 77 | 54 | 0 | 97 | 84 | 0 | assessed | clear names, with weaker sampled intent and local structure signals |
| antfu | 94 | 87 | 100 | 100 | 96 | 0 | assessed | consistently strong intent and visible patch signals |
| kentcdodds | 86 | 71 | 0 | 100 | 90 | 0 | assessed | clear visible structure; message syntax is not a penalty |

\* Conventional syntax is retained as a diagnostic value for Workflow only;
it is not included in the Clarity calculation. All six AI responses supported
the deterministic Clarity result, so no ±4 adjustment was eligible.

## Context v4 live probe

This rerun used the same six-profile set after reducing incidental metadata
weight. Compared with v3, direct patch explanations and commit context now
drive 70% of score movement; repository orientation and handoff metadata
together drive 10%. The resulting changes are intentionally small because the
underlying evidence did not change.

| Profile | Context | Δ vs v3 | Patch explanation | Orientation artifact | Commit context | Repository orientation | Handoff | Personal commits | Patch commits | AI adjustment |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| lafllamme | 67 | -2 | 51 | 60 | 59 | 80 | 50 | 17 | 17 | 0 |
| danielroe | 70 | 0 | 58 | 50 | 64 | 74 | 67 | 18 | 18 | 0 |
| torvalds | 81 | +1 | 85 | 51 | 71 | 80 | 50 | 11 | 11 | 0 |
| sindresorhus | 66 | -1 | 51 | 55 | 61 | 74 | 50 | 18 | 18 | 0 |
| antfu | 65 | -1 | 52 | 52 | 56 | 80 | 50 | 18 | 18 | 0 |
| kentcdodds | 72 | -1 | 51 | 56 | 74 | 80 | 60 | 18 | 18 | 0 |

The values remain explainable: Torvalds is highest because the bounded patch
sample contains the strongest explanation signal; Kent remains above neutral
because commit context is strong. No profile receives a high score from
repository presence or commit volume alone. All six AI reviews were assessed
with 60% global confidence and produced no accepted Context adjustment.

## Context v3 live probe

This run exercised Context v3 against the fixed six-profile regression set
after re-centering the formula. With enough personal evidence, 60 is neutral;
the run does not award points for commit volume or developer reputation. The
AI remained a bounded second check. All six responses supported the
deterministic Context result, but their global confidence was 60, so no Context
adjustment was accepted.

| Profile | Context | Patch explanation | Orientation artifact | Commit context | Repository orientation | Handoff | Personal commits | Patch commits | AI adjustment | Interpretation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| lafllamme | 69 | 51 | 60 | 59 | 80 | 50 | 17 | 17 | 0 | neutral patch explanations, with repository orientation and specific commit context providing a measured lift |
| danielroe | 70 | 58 | 50 | 64 | 74 | 67 | 18 | 18 | 0 | no visible orientation-artefact change, but commit and reviewed handoff context are present |
| torvalds | 80 | 85 | 51 | 71 | 80 | 50 | 11 | 11 | 0 | strongest visible patch explanations and specific commit context in the bounded personal sample |
| sindresorhus | 67 | 51 | 55 | 61 | 74 | 50 | 18 | 18 | 0 | release/package breadth is not treated as context, while modest orientation and commit signals remain |
| antfu | 66 | 52 | 52 | 56 | 80 | 50 | 18 | 18 | 0 | mostly neutral explanation and commit signals; repository orientation creates only a small lift |
| kentcdodds | 73 | 51 | 56 | 74 | 80 | 60 | 18 | 18 | 0 | explicit commit context and handoff evidence lift an otherwise neutral patch-explanation signal |

The v3 results are materially different from v2 because a sufficient sample
without strong context is no longer scored as a failing 50. The spread still
comes from visible evidence: Torvalds has the highest patch-explanation and
commit-context signals, while Kent's result is driven by specific commit
context and reviewed handoff evidence. This is calibration evidence for a
bounded public sample, not a general engineering ranking.

## Context v2 live probe

This run exercised Context v2 against the fixed six-profile regression set.
The server used visible explanatory additions, orientation artifacts, commit
body intent, root-entry orientation, and a small handoff signal. The combined
AI review stayed a second check; its global confidence was 60 for these
responses, so no Context adjustment was accepted.

| Profile | Context | Patch explanation | Orientation artifact | Commit context | Repository orientation | Handoff | Personal commits | AI adjustment | Interpretation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| lafllamme | 57 | 51 | 60 | 54 | 80 | 50 | 17 | 0 | limited visible explanation in the sampled patches; repository affordances provide only a small lift |
| danielroe | 58 | 58 | 50 | 53 | 74 | 67 | 18 | 0 | some commit and handoff context, but no visible orientation artifact signal |
| torvalds | 72 | 85 | 51 | 83 | 80 | 50 | 11 | 0 | strongest visible explanation and commit rationale in the bounded sample |
| sindresorhus | 56 | 51 | 55 | 58 | 74 | 50 | 18 | 0 | release/package breadth does not count as orientation by itself |
| antfu | 54 | 52 | 52 | 50 | 80 | 50 | 18 | 0 | focused delivery does not become Context without visible explanation evidence |
| kentcdodds | 61 | 51 | 56 | 76 | 80 | 60 | 18 | 0 | explicit commit context helps, while patch explanations remain limited |

The result is intentionally not a ranking of engineering ability. It shows
what the selected public change window explains to a next contributor. In
particular, high commit volume, repository README presence, and good local code
structure do not automatically create a high Context score.

## Previous six-profile audit

| Profile | Clarity | Safety | Workflow | Complexity | Context | Overall | Main limitation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| lafllamme | 77 | 66 | 68 | 66 | 82 | 72 | broad product changes in a small sample |
| danielroe | 89 | 68 | 76 | 89 | 66 | 78 | little visible defensive evidence |
| torvalds | 56 | 65 | 62 | 69 | 60 | 62 | only a few personal commits after merge filtering |
| sindresorhus | 34 | 73 | 46 | 32 | 61 | 49 | package/release breadth and vague subjects |
| antfu | 90 | 67 | 83 | 95 | 74 | 82 | broad sampled surface despite focused patterns |
| kentcdodds | 60 | 75 | 64 | 81 | 66 | 69 | small public sample |

These values motivated ownership separation, merge filtering, the Complexity
v2 change, and the neutral evidence fallback. They must not be copied into a
mock or used as fixed expectations for a future live fetch.

## Recorded Complexity v2 example

For lafllamme, the deterministic baseline was:

~~~text
scope       60 × 0.50 = 30.0
outliers    88 × 0.30 = 26.4
churn      100 × 0.20 = 20.0
                         ─────
                         76.4 → 76
~~~

A grounded AI review with two patch references applied the allowed +4, so the
final Complexity value became 80. The AI did not replace the formula.

## Historical interpretation

- torvalds is evidence-limited after merge commits are excluded; a neutral
  result is not a claim about engineering ability.
- sindresorhus demonstrates why raw average files per commit over-penalizes
  release and package changes.
- Commit frequency is a factual chart signal, not a quality bonus.
- The six-profile audit is a regression lens; larger evidence windows are
  required before role thresholds become production rankings.
