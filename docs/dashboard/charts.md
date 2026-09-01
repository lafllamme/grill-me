# Dashboard Charts

**Version:** 1.0.0
**Status:** active
**Updated:** 2026-09-01

Charts make the roast inspectable. They support the information hierarchy; they
do not replace the verdict or introduce unexplained scores.

## Information hierarchy

1. Verdict — what the agent concluded.
2. Profile — the five dimensions behind it.
3. Evidence — commits, files, and changes that support it.
4. Detail — where the repository needs attention.

## Chart contract

| Chart | Question | Data source | Status |
| --- | --- | --- | --- |
| Ring | How do the five profile signals compare compactly? | normalized axis scores | complete |
| Radar | What shape does the profile have? | five 0–100 axis scores | complete |
| Bar | How much changed per commit? | additions and deletions | complete |
| Line | How does change evolve over time? | chronological commits and explicit measures | complete |
| Gauge | How frequently did this profile ship in the window? | commit count, normalized for display | complete |
| Sunburst | Where is repository change concentrated? | repository → directory → file hierarchy | complete |

The current Explorer uses one selected mock/live profile contract for every
card. Switching a mock profile changes all cards together; no card owns an
independent random dataset.

## Bklit porting rule

For every chart, the linked Bklit documentation and GitHub source are the
implementation source of truth. Before calling a chart ported, check the
selected example, imports, child components, context, props, geometry,
responsive sizing, hover, loading, empty, motion, and reduced-motion behaviour
in a real browser. Intentional omissions must be recorded here before coding.

## Mock and loading rules

The radar is one series with five category points. A second decorative series is
not added to make a sparse profile look fuller. The ring shows the score and its
percentage equivalent because both use the normalized 0–100 scale; raw GitHub
totals stay in Evidence and Frequency cards.

Loading belongs to the shared analysis lifecycle, not to independent chart
timers. The root owns idle, loading, empty, error, and ready; panels keep their
final grid positions and receive only the state they need.

## Definition of done

- Meaning is stated in plain language.
- Every value maps to a real or explicitly mocked field.
- Existing API contracts remain unchanged.
- Required Bklit source and dependencies are identified.
- Default, hover, active, loading, empty, and reduced-motion states are checked
  where relevant.
- Browser parity is checked before the chart is marked complete.
- Unit, type, lint, and relevant E2E checks pass.

## Current sequence

Ring → Bar → Radar → Line → Gauge → Sunburst. A Composed Chart was removed
from scope because Bar and Line answer the evidence questions separately.
