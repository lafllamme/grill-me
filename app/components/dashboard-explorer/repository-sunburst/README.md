# Repository sunburst

The repository sunburst is the full-width file and folder evidence view. The
current fixture mirrors the Bklit hierarchy; the future GitHub adapter should
replace it with repository paths and change-volume values.

Hover and drill-down behavior remain in `BklitSunburstChart`. This panel only
adds the dashboard heading and metadata.

The chart keeps the complete file path in its accessible label, SVG title, and
hover hint. Visible labels are shortened to the available arc width so a long
filename cannot escape the segment. During drill-down, the center hub is filled
with the active branch color and acts as the zoom-out control. Mouse selection
does not leave a browser focus rectangle; keyboard focus still exposes a
visible focus state.
