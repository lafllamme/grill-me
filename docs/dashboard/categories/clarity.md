# Clarity Scoring

**Version:** 4.0.0<br>
**Status:** calibrated<br>
**Updated:** 2026-09-02

## Question

Can another developer understand the intent, names, and local shape of the
sampled changes?

Clarity is about the communication surface of a change. It is not a claim
about the complete AST, every file in a repository, or the developer's overall
ability. Merge commits are excluded because their messages and patches usually
describe integration work rather than the author's own change.

## Deterministic formula

~~~text
Clarity = messageSignal * 0.35
        + namingSignal * 0.30
        + structureSignal * 0.35
~~~

All terms are clamped to 0–100. The score requires at least three sampled
commits and three personal non-merge commits. Otherwise it returns neutral 50
with insufficient evidence.

After the raw score is calculated, an evidence ceiling is applied:

~~~text
if total commits < 3 or personal commits < 3:
  Clarity = 50
else if visible patch commits < 3 or personal commits < 6:
  Clarity = min(rawClarity, 90)
else:
  Clarity = min(rawClarity, 95)
~~~

The ceiling is not a quality penalty. It prevents a small or thin patch sample
from becoming an automatic 98–100 while keeping the underlying signals and
their weights unchanged. Even with a broad sample, Clarity is capped at 95;
the AI cannot bypass this server-side cap.

### Signals

| Signal | How it is derived | Why it belongs here |
| --- | --- | --- |
| `messageSignal` | Information density of personal commit subjects: specificity, action language, and conventional prefixes | Measures whether the change intention is communicated before reading the patch |
| `conventionalMessageRatio` | Share of personal commit subjects using a recognized conventional prefix and non-empty subject | Diagnostic workflow context only; it is deliberately not a Clarity input |
| `namingSignal` | Added patch declarations with descriptive identifiers; generic names such as `x`, `data`, `item`, `tmp`, or `result` lower the signal | Answers whether the visible names help a new reader understand the change |
| `structureSignal` | Added non-comment code lines; lines longer than 120 characters and deeply indented additions lower the signal | Uses only visible local structure instead of guessing from repository size |

If no added declaration or code line is present in the selected patches, that
component is neutral 50 and marked as unavailable. Missing patch evidence is a
coverage limitation, not a quality penalty.

File count, commit size, change volume, repository popularity, and conventional
commit syntax are not Clarity inputs. Conventional syntax belongs to Workflow;
the other signals are intentionally left to Workflow and Complexity so one
large repository cannot be penalized twice.

## AI second check

The combined AI request receives the same bounded patch sample as the other
categories plus the deterministic Clarity breakdown. It is asked to inspect
semantic naming, local structure, and intent that are visible in the supplied
changed lines. It must not infer Clarity from commit count, file count,
repository size, or missing excerpts. The accepted axis review includes a
short summary and exact patch references; the Profile panel renders those
beside the deterministic signals.

The AI cannot replace the deterministic score. A grounded axis review needs
confidence ≥70 and two distinct patch references before the server accepts a
bounded adjustment of at most ±4. A support review still needs one grounded
reference so its explanation is auditable; an insufficient review may have no
evidence. A support or insufficient review changes nothing; a softening or
contradicting review is ignored unless its references are grounded in the
selected patches.

The server applies the evidence ceiling after this adjustment. AI interpretation
can explain or soften the result, but it cannot turn a thin sample into a strong
Clarity score.

## Validation

| Scenario | Expected |
| --- | --- |
| Three explicit conventional commits with descriptive names and short local code | Strong Clarity signal, typically above 85 |
| Three clear commits with visible patches | Raw signal may be near-perfect, but the evidence ceiling keeps Clarity at or below 90 |
| Six or more personal commits with at least three visible patches | Strong evidence can reach 95, never 100 |
| Generic subjects with vague names and deeply indented additions | Low Clarity signal, typically below 45 |
| Clear messages but no usable patch excerpts | Message signal remains visible, naming and structure stay neutral 50 |
| One or two personal commits | Neutral 50 because evidence is insufficient |
| Merge-only sample | Neutral 50 because no personal evidence survives filtering |

## Known limits

The naming and structure checks are intentionally small heuristics over visible
added patch lines. They do not parse a complete AST, understand every naming
convention, or prove that a short line is good code. The evidence ceiling also
means a public sample with only a few patches cannot prove exceptional Clarity.
The AI second check adds semantic context but remains bounded by the same patch
and evidence limits.
