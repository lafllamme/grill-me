# Colors

## Final Color System: Signal Red / Basalt / Bone

`grillme.dev` is a dark-first system with one deliberate active accent. The
current product direction is Signal Red, not the earlier Ember/Orange
prototype. This distinction is important: the visual language should feel
hot and direct without turning every surface into a warning state.

## Color Families

### Signal Red

Signal Red is the product accent family:

- `signal-red-500`: `#f0444d` — live status, focus light, bright highlights
- `signal-red-600`: `#d92d36` — hover and active emphasis
- `signal-red-700`: `#b91f2b` — semantic `primary`, CTA, selected state
- `signal-red-800`: `#981b27` — pressed and contained emphasis
- `signal-red-900`: `#7e1d26` — deep accent container

Use Signal Red for CTAs, selected navigation, grades, active metrics, live
status and focused highlights. Do not use it as a full-page background or as a
decorative texture.

### Basalt

Basalt is the structural dark neutral family:

- `basalt-950`: `#0f0e0d` — page background
- `basalt-900`: `#181614` — primary shell
- `basalt-800`: `#292522` — elevated surface
- `basalt-700`: `#3d3833` — stronger contrast surface

The complete scale is defined in `uno.config.ts`. Basalt carries the page,
navigation, cards, dividers and elevation layers.

### Pure black is a stage, not the system

The active homepage intentionally uses pure black for the immersive hero,
entry overlay and selected full-bleed stages. That is a composition decision,
not a replacement for the Basalt token system.

- pure black: cinematic hero, entry cover and hard stage transitions
- `background` / `basalt-950`: normal page foundation
- `surface*`: panels, cards and local hierarchy

This keeps the hero visually decisive while allowing dark modules to separate
from one another further down the page.

### Bone

Bone is the warm light neutral family:

- `bone-50`: `#fffdf9` — brightest copy and inverse surface
- `bone-100`: `#fcf7f0` — primary copy and paper surface
- `bone-200`: `#f5ebdf` — soft contrast
- `bone-400`: `#d8bfa8` — muted warm copy

Bone prevents the dark system from becoming sterile. It is used for primary
copy, paper/receipt surfaces and intentional inverse modules.

### Ember (legacy)

`ember-*` remains in the token file so existing exploratory work does not
break. It is deprecated for product UI. New components must use Signal Red,
Basalt and Bone instead.

## Semantic Tokens

Semantic component classes are preferred over raw scale classes:

- `primary`: `signal-red-700`
- `primary-strong`: `signal-red-500`
- `primary-container`: `signal-red-900`
- `primary-soft` / `primary-muted`: restrained Signal Red alpha surfaces
- `background`: `basalt-950`
- `surface*`: Basalt structural layers
- `on-background` / `on-surface`: Bone primary copy
- `on-surface-variant`: warm muted copy
- `border` / `divider` / `outline`: low-contrast Bone alpha lines
- `glow`: localized Signal Red atmosphere only

## Rules

- Use UnoCSS semantic token classes; do not add raw hex values in components.
- Signal Red is signal, not wallpaper.
- Surfaces establish hierarchy before color does.
- Text must remain readable without depending on accent color alone.
- A component should not use Ember and Signal Red as competing brand accents.
- Review any new color against the accessible contrast guidance before shipping.

See [`rules.md`](./rules.md) for the complete layout, typography, radius,
motion and component-state rules.
