# Dashboard Roles

**Version:** 1.1.1
**Status:** exploratory contract
**Updated:** 2026-09-01

Roles describe a dominant pattern in the five scores. They never replace the
overall grade and they cannot bend a formula toward a desired joke.

## Matrix

| Group | Role | Clarity | Safety | Workflow | Complexity | Context |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Positive | [Human Compiler](../profiles/human-compiler.md) | ≥85 | ≥60 | ≥60 | ≥65 | ≥65 |
| Positive | [Edge-Case Sheriff](../profiles/edge-case-sheriff.md) | ≥65 | ≥85 | ≥60 | ≥60 | ≥60 |
| Positive | [Dependency Detective](../profiles/dependency-detective.md) | ≥70 | ≥65 | ≥60 | ≥85 | ≥60 |
| Positive | [Git Gardener](../profiles/git-gardener.md) | ≥70 | ≥60 | ≥85 | ≥60 | ≥60 |
| Positive | [Ungrillable](../profiles/ungrillable.md) | ≥80 | ≥80 | ≥80 | ≥80 | ≥80 |
| Mixed | [Freddy Spaghetti](../profiles/freddy-spaghetti.md) | 40–60 | ≥65 | ≥65 | ≥60 | ≥65 |
| Mixed | [Risk Runner](../profiles/risk-runner.md) | ≥65 | 40–60 | ≥65 | ≥65 | ≥65 |
| Mixed | [Careful Squasher](../profiles/careful-squasher.md) | ≥70 | ≥70 | 40–60 | ≥60 | ≥70 |
| Mixed | [Wrapper Addict](../profiles/wrapper-addict.md) | ≥65 | ≥65 | ≥65 | 40–60 | ≥65 |
| Mixed | [Docs Dodger](../profiles/docs-dodger.md) | ≥65 | ≥65 | ≥65 | ≥65 | ≤50 |
| Negative | [Brain Dumper](../profiles/brain-dumper.md) | ≤35 | ≥55 | ≥55 | ≥55 | ≥55 |
| Negative | [Finger Crosser](../profiles/finger-crosser.md) | ≥55 | ≤35 | ≥55 | ≥55 | ≥55 |
| Negative | [Big-Bang Committer](../profiles/big-bang-committer.md) | ≥55 | ≥55 | ≤35 | ≥55 | ≥55 |
| Negative | [Merge Conflict Magician](../profiles/merge-conflict-magician.md) | ≥55 | ≥55 | ≥55 | ≤35 | ≥55 |
| Negative | [README Houdini](../profiles/readme-houdini.md) | ≥55 | ≥55 | ≥55 | ≥55 | ≤35 |
| Cross-axis | [Vibe Coder](../profiles/vibe-code.md) | multiple ≤35 | multiple ≤35 | multiple ≤35 | multiple ≤35 | multiple ≤35 |

Ungrillable is checked first as the all-strong pattern. Among the remaining
matches, specific dominant-axis roles (`Edge-Case Sheriff`, `Dependency
Detective`, and `Git Gardener`) are checked before the broader `Human Compiler`
label. All matching roles are still collected as candidates. This keeps a
complexity- or workflow-dominant profile from being flattened into a generic
positive role while preserving the full matrix evidence.

## Evidence rules

- Every role needs enough personal evidence to classify the profile.
- A mixed role has one deliberate weak axis and stable supporting axes.
- A negative role has one dominant failure mode; it is not a claim that the
  whole developer is bad.
- No role match means Unclassified, not a forced label.
- 50 means insufficient evidence only when the category gate says so.

The grade remains the arithmetic mean of the five axes. See [Scoring](./scoring.md).
