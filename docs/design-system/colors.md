# Colors

## Final Color System: Ember / Basalt / Bone

`grillme.dev` is now a dark-first, one-accent-only system.

The page structure comes from dark mineral neutrals and warm off-whites. Orange is no longer allowed to do every job at once. It is reserved for heat, emphasis, and active signal.

## Color Families

### `Ember`

Brand and heat accent family. The anchor color is `Ember 500 = #ff4925`.

Why `500`:

- it is the chosen brand orange
- it sits at the center of the usable accent range
- lighter values support glow and emphasis
- darker values support contained heat, pressed states, and tonal gradients

Scale:

- `ember-50`: `#faf6f5`
- `ember-100`: `#f6ebe9`
- `ember-200`: `#f1d5d0`
- `ember-300`: `#eeb1a5`
- `ember-400`: `#f27c64`
- `ember-500`: `#ff4925`
- `ember-600`: `#e12d09`
- `ember-700`: `#b6280c`
- `ember-800`: `#882511`
- `ember-900`: `#5d1f13`
- `ember-950`: `#38160f`

Use for:

- CTA emphasis
- active nav state
- one hero emphasis word or line
- heat/metaphor controls such as sliders or progress
- selected chips and toggles
- hot metrics and focused highlights

### `Basalt`

Structural dark neutral family. This family carries the page, shells, cards, and separation. It should read drier and more mineral than `Bone`, with less beige content and more char/smoke character.

Scale:

- `basalt-50`: `#f5f4f2`
- `basalt-100`: `#ece8e4`
- `basalt-200`: `#d7d1cb`
- `basalt-300`: `#b4aca5`
- `basalt-400`: `#8d837a`
- `basalt-500`: `#665d56`
- `basalt-600`: `#504943`
- `basalt-700`: `#3d3833`
- `basalt-800`: `#292522`
- `basalt-900`: `#181614`
- `basalt-950`: `#0f0e0d`

Use for:

- page background
- nav glass base
- elevated panels
- section shells
- borders and layered surfaces

### `Bone`

Warm light neutral family for type and soft contrast. This keeps the system from feeling sterile white-on-black. It should read lighter, softer, and more paper-like than `Basalt`.

Scale:

- `bone-50`: `#fffdf9`
- `bone-100`: `#fcf7f0`
- `bone-200`: `#f5ebdf`
- `bone-300`: `#ead8c6`
- `bone-400`: `#d8bfa8`
- `bone-500`: `#c1a68d`
- `bone-600`: `#a3846d`
- `bone-700`: `#856956`
- `bone-800`: `#685143`
- `bone-900`: `#47372f`
- `bone-950`: `#2a201b`

Use for:

- primary text
- secondary text
- quiet editorial contrast
- subtle inverse surfaces when needed

## Semantic Tokens

Components should use semantic tokens, not raw scale values, unless the component is explicitly a palette reference or documentation block.

### Surfaces

- `background`: `basalt-950`
- `surface`: dark primary shell
- `surface-container-low`: lowest elevated container
- `surface-container`: default panel container
- `surface-container-high`: elevated panel
- `surface-container-highest`: highest local surface
- `surface-container-lowest`: deepest dark base
- `surface-variant`: stronger dark contrast surface
- `surface-bright`: brightest structural dark surface

### Content

- `on-background`: primary text on the page background
- `on-surface`: primary text on panels and surfaces
- `on-surface-variant`: secondary/meta text

### Accent

- `primary`: `ember-500`
- `primary-strong`: bright heat emphasis
- `primary-soft`: restrained orange tint
- `primary-container`: contained dark heat surface
- `primary-muted`: very soft orange tint

### Support

- `border`: default border
- `divider`: subtle section separation
- `outline`: stronger hairline/outline
- `glow`: localized atmosphere only
- `error`: same as `primary` in this pass
- `success`: muted green support signal

## Usage Rules

### Primary is signal, not wallpaper

Orange should not carry large page sections by default.

Allowed:

- CTA fills
- active state emphasis
- one hero accent line
- sliders and heat controls
- focused stats or badges

Avoid:

- full-section orange washes
- orange as the default panel color
- repeating orange in nav, hero, cards, metrics, and background at the same time

### Surfaces carry the product

Use `background` and `surface*` for structure.

This is the default mental model:

- page = `background`
- main modules = `surface` or `surface-container`
- stronger separation = `surface-container-high` or `surface-variant`
- deepest shell = `surface-container-lowest`

### Text hierarchy stays warm

Use:

- `on-surface` for main headings and body
- `on-surface-variant` for labels, system strings, metadata, and support copy

Do not fall back to hard white unless there is a documented reason.

### Glow is local

`glow` exists for atmospheric hotspots only.

Allowed:

- blurred local ember spots
- tight CTA or hero focus

Avoid:

- whole-page orange haze
- entire section backgrounds built from glow alone

## Implementation Rules

- Define raw scales and semantic tokens centrally in [`/Users/flame/Developer/Projects/grill-me/uno.config.ts`](/Users/flame/Developer/Projects/grill-me/uno.config.ts)
- Use UnoCSS token classes only in components
- Do not introduce ad-hoc hex values in product UI
- Use [`/Users/flame/Developer/Projects/grill-me/app/pages/test.vue`](/Users/flame/Developer/Projects/grill-me/app/pages/test.vue) as the proving ground before remapping production modules

## Ember palette usage

- Ember orange is reserved for heat/intensity signals, never decoration.
- Backgrounds stay in the charcoal ramp; ember appears only as glow accents.
- Text on ember fills uses near-black, not white — better warmth retention.
