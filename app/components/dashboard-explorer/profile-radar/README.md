# Profile radar

The profile radar presents the user's five-dimensional repository profile.
The panel owns the dashboard-specific red palette mapping; `BklitRadarChart`
remains the reusable chart implementation.

## Data contract

The component accepts the existing `radarProfile` fixture shape: metric
definitions plus one or more series with values keyed by metric key.

## Future data source

Replace the fixture with deterministic scores derived from the GitHub analysis
snapshot. The AI should explain those scores, not calculate replacement values.
