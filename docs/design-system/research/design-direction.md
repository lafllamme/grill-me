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

The homepage applies these tiers selectively. Navigation, roast-level modules, featured evidence media, and the final CTA may use soft geometry. Chapter cuts, metadata rails, evidence tables, and archive rows remain sharp so the Fuel-inspired editorial grid keeps its precision.

### 4. Glass needs mass

Glass is not a transparent gray rectangle. It needs a dark tint, a subtle light-facing border, a deeper lower edge, and enough opacity to keep text stable over the animated background.

### 5. Background continuity is designed

Sections may cover the Prism background, but transitions should use masks, tinted shadows, and black-to-transparent fades. The background should disappear and return intentionally, never at an abrupt rectangular edge.

### 6. Calm framing, live center

Navigation, explanatory copy, and secondary metrics stay restrained. Motion and streaming activity concentrate inside the roast stage. This avoids turning the whole page into an animated demo reel.

Live text motion uses a muted readable baseline with one Signal-Red shimmer pass. The pass must not turn the full label white, hide it between cycles, or imply fabricated chain-of-thought. Its current reference is [AI Elements Shimmer](https://elements.ai-sdk.dev/components/shimmer), adapted to the Signal Red palette.

### 7. Rounded does not mean friendly SaaS

The combination of tight display typography, sparse labels, deep shadows, warm off-white copy, and asymmetrical composition keeps the system sharp despite soft geometry.

### 8. Chapters cover each other

The page uses a Fuel-inspired chapter wipe rather than a rectangular section cut. The Prism scene stays sticky behind the hero and target flow, drifting upward at a reduced scroll rate. A warm off-white investigation chapter then rises over it while its cover animates from flat to an approximately seven-degree angle.

The diagonal belongs to a dedicated background layer. Content, rules, and interaction surfaces remain straight. Investigation and product explanation continue on the light editorial surface before a dedicated dark footer closes the sequence with a shorter, faster transition plate and an oversized Grillme wordmark.

Native sticky positioning and document flow create the parallax relationship. Lenis only interpolates global scroll input; CSS timelines own chapter geometry and Motion-V advances the Lenis frame. Do not drive the background through per-frame Vue reactivity. The shader receives overscan so its edge cannot become visible while the viewport and browser chrome change size.

### 9. One data type, one primary display location

Do not repeat live data to make a chapter look populated. Every product datum has one authoritative visual home:

- current username, heat, and stream state: evidence context rail
- current score and evidence counts: evidence metrics rail
- grade and verdict title: final evidence surface
- public examples: featured receipt and receipt archive
- aggregate platform values: aggregate stats chapter

Other chapters explain the product using stable concepts, not duplicated user state. This rule keeps the page legible while a roast progressively streams.

### 10. Motion has separate owners

- Lenis owns global wheel interpolation and anchor navigation.
- CSS view and scroll timelines own continuous chapter covers, hero drift, bounded-media parallax, and sticky settling.
- Motion-V owns one-shot viewport reveals and provides the shared Lenis animation frame.
- Every neutral homepage chapter headline uses the shared `RebrandScrollHeadline` primitive and the `fuel-editorial-headline` typography shortcut.
- Editorial copy is measured as one continuous text run and revealed by actual browser line, never by one observer or animation per character.
- Primary product and pipeline statements should provide enough copy for roughly four to five desktop lines. Short verdicts, CTA headlines, and footer wordmarks remain intentionally compact.
- Each line rises by one full line-height through an overflow mask over `820ms`, staggered by `110ms`, with `[0.4, 0, 0.2, 1]` easing.
- Explicit line composition is reserved for intentional brand moments such as the hero; responsive editorial copy must derive its lines from layout.
- Parallax is limited to the opening atmosphere and bounded evidence visuals; explanatory text remains stable.
- Local effects such as the velocity marquee may run only while visible and must not install another permanent scroll listener.
- Reduced-motion mode replaces all movement with immediately visible final states.

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

## Homepage layout at `/`

- a flat, dark navigation bar over an oversized hero and target stage sharing one sticky Prism scene
- a scroll-linked off-white product statement with one vocabulary marquee
- one evidence portfolio for the active roast, with stable rails and four sticky focal surfaces
- a reduced four-step pipeline and three roast-level surfaces
- one featured public receipt and an archive of independent demo receipts
- a final roast CTA, conditional aggregate stats, method FAQ, and terminal footer

`/test-1` remains the first direction study. `/` is the active homepage composition.

The result area on `/` integrates the verdict into the final evidence surface. The real reasoning trail remains part of the streamed experience while title, grade, evidence, roast points, and useful feedback retain distinct visual hierarchy without a second verdict chapter.

## Explicit non-goals

- no generic chat transcript
- no wall of equal feature cards
- no neon-red-on-pure-black cyberpunk treatment
- no purple AI gradient language
- no production token migration during exploration
- no new font family; the existing Bricolage Grotesque, General Sans, Azeret Mono, and Zodiak roles remain
