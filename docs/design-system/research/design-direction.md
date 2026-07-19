# Grillme rebrand direction

Status: exploration, not production contract.

## Direction in one sentence

Grillme should feel like a calm, dark analysis chamber in which Signal Red builds pressure and the roast becomes the only loud event.

## The recurring system

The references repeatedly use the same three-layer composition:

1. **Atmosphere**: a full-page dark field, image, mesh, or glow creates continuity.
2. **Section shells**: a small number of large rounded surfaces structure long pages without hiding the atmosphere everywhere.
3. **Product stage**: one dominant interface or visual carries the product story; smaller cards live inside or around it.

This is more useful than applying glass and border radius to every element. The hierarchy comes from scale and containment.

## Proposed design principles

### 1. Stage before sections

The roast input, analysis progress, and result share one large visual stage. Marketing sections explain that stage instead of competing with it.

### 2. Signal Red is pressure, not wallpaper

Red appears as a moving background signal, active state, selected intensity, progress trace, and reveal accent. Most readable surfaces remain warm-black, graphite, and bone.

### 3. Soft geometry at macro scale

Use generous radii on navigation, hero stages, section shells, and large media frames. Inner controls use smaller radii. Avoid making every label a pill.

Working radius tiers:

- macro shell: `32-48px`
- module: `20-28px`
- control: `12-16px`
- pill: reserved for actions, status, or compact selectors

### 4. Glass needs mass

Glass is not a transparent gray rectangle. It needs a dark tint, a subtle light-facing border, a deeper lower edge, and enough opacity to keep text stable over the animated background.

### 5. Background continuity is designed

Sections may cover the Prism background, but transitions should use masks, tinted shadows, and black-to-transparent fades. The background should disappear and return intentionally, never at an abrupt rectangular edge.

### 6. Calm framing, live center

Navigation, explanatory copy, and secondary metrics stay restrained. Motion and streaming activity concentrate inside the roast stage. This avoids turning the whole page into an animated demo reel.

### 7. Rounded does not mean friendly SaaS

The combination of tight display typography, sparse labels, deep shadows, warm off-white copy, and asymmetrical composition keeps the system sharp despite soft geometry.

## Selected exploration palette

Signal Red is the selected direction for component and layout exploration:

- `ink`: warm near-black base
- `panel`: translucent, red-tinted black
- `panel-high`: stronger contained surface
- `copy`: warm near-white
- `muted`: dusty warm gray
- `signal-red-700 = #B91F2B`: accessible primary fill and selected control
- `signal-red-500 = #F0444D`: live activity, focus, and glow
- `signal-red-900 = #7E1D26`: depth, shadow, and Prism anchor
- `ink = #080708`: primary atmospheric base
- `panel`: translucent black with only a minimal red bias
- `copy = #F8EEEE`: warm near-white
- `muted = #C5B2B4`: dusty warm gray

The Amaranth, Coral, Log Cabin, Rangoon, Oxblood, Carmine, and Vermilion candidates are retired. They remain part of the decision history only and must not remain as runtime options or parallel token systems.

The earlier `#B5284E` direction was rejected because the blue component pushed the Prism and glass surfaces toward magenta/purple. `#FF0059` remains a useful high-energy reference, but it is too pink and too dominant as the default brand fill.

## Layout concept for `/test-2`

- a compact floating navigation island adapted from the current production header
- an oversized editorial hero with Prism visible through the negative space
- a dedicated target stage containing only username and intensity
- a separate agent-analysis stage that explains real streamed events rather than fake percentage progress
- asymmetric black veils above and below opaque chapters so the Prism disappears and returns without a hard cut
- a three-job bento field tied directly to evidence, controlled heat, and result delivery
- a full-height final reveal where the roast is the largest element on the page

`/test-1` remains the first direction study. `/test-2` is the active homepage composition and the preferred source for component extraction.

## Explicit non-goals

- no generic chat transcript
- no wall of equal feature cards
- no neon-red-on-pure-black cyberpunk treatment
- no purple AI gradient language
- no production token migration during exploration
- no new font family; the existing Bricolage Grotesque, General Sans, Azeret Mono, and Zodiak roles remain
