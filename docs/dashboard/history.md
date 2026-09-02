# Dashboard Scoring History

**Status:** calibration record
**Updated:** 2026-09-02

This file contains calibration evidence that should not be mixed into the
active formula contract. The values describe a bounded public sample, not a
general ranking of the named developers.

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
