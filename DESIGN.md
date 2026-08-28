# Grillme Design Direction

## Product character

Grillme is an evidence-backed roast for public GitHub code. The interface
should feel sharp, theatrical, and technically credible: one clear signal,
strong editorial hierarchy, and enough restraint that the roast remains the
focus.

The visual language is dark-first, but it must work as a calm light system as
well. Surface contrast establishes hierarchy before color does. Cards should
read as intentional stages, not as a pile of competing panels.

## Canonical palette

### Signal Red — active signal

Signal Red is the only active product accent. It is used for actions, selected
states, grades, live status, focus details, and small moments of pressure.

| Token | Hex | Role |
| --- | --- | --- |
| `signal-red-500` | `#f0444d` | bright status, focus light, live activity |
| `signal-red-600` | `#d92d36` | hover and active emphasis |
| `signal-red-700` | `#b91f2b` | primary CTA, selected state, semantic primary |
| `signal-red-800` | `#981b27` | pressed or contained emphasis |
| `signal-red-900` | `#7e1d26` | deep accent container and atmosphere |

Red is signal, not wallpaper. A module should have one primary red action or
accent moment, not a red surface plus several competing red decorations.

### Basalt — structure and depth

Basalt provides the dark foundation, shells, dividers, and elevated surfaces.

| Token | Hex | Role |
| --- | --- | --- |
| `basalt-950` | `#0f0e0d` | normal page foundation |
| `basalt-900` | `#181614` | primary shell |
| `basalt-800` | `#292522` | elevated surface |
| `basalt-700` | `#3d3833` | strong contrast surface |

Pure black (`#000000`) is reserved for cinematic hero moments, entry cover,
and hard full-bleed transitions. It is a stage, not the whole system.

### Bone — warm contrast

Bone keeps the dark system human and supplies warm inverse surfaces and copy.

| Token | Hex | Role |
| --- | --- | --- |
| `bone-50` | `#fffdf9` | brightest warm surface and inverse copy |
| `bone-100` | `#fcf7f0` | paper surface and primary warm copy |
| `bone-200` | `#f5ebdf` | soft contrast |
| `bone-400` | `#d8bfa8` | muted warm copy |

## Chosen surface winners

### Dark winner: Void Whisper

Void Whisper is the selected dark profile because it keeps the interface
crisp and premium without making the card separation noisy.

| Surface role | Hex | Meaning |
| --- | --- | --- |
| Stage | `#050505` | quiet ink foundation |
| Context | `#0b0b0b` | supporting layer |
| Bento card | `#111112` | softly lifted content surface |
| Primary copy | `#f7f3ee` | warm near-white |
| Muted copy | `#9f9993` | restrained metadata |

### Light winner: Slate Cloud

Slate Cloud is the selected light profile. It keeps the page near-white while
giving every Bento module enough separation to remain legible and composed.

| Surface role | Hex | Meaning |
| --- | --- | --- |
| Stage | `#e5e8e9` | cool, softened light canvas |
| Context | `#edf0f0` | intermediate surface |
| Bento card | `#fbfcfc` | crisp lifted card |
| Primary copy | `#1a211e` | dark ink |
| Muted copy | `#4e4e4e` | readable secondary copy |
| Stage ↔ card contrast | `1.20:1` | surface separation, not text WCAG contrast |

Slate Cloud Soft and Slate Cloud Rich remain adjacent exploration variants:

- Soft: `#eef1f1` stage → `#ffffff` card (`1.14:1`)
- Rich: `#dde2e3` stage → `#f8faf9` card (`1.25:1`)

They are comparison candidates, not replacements for the current winner.

## Surface rules

- Use a slightly differentiated stage and card surface when a Bento module
  needs to be read as a unit.
- Prefer surface color over decorative borders or shadows for separation.
- Keep the light system close to white; contrast should feel deliberate, not
  gray and generic.
- Keep dark cards quiet. The card should support the content instead of
  competing with the red action.
- Graphs inherit the active profile's readable text and label colors while
  retaining the canonical chart palette for cross-profile comparison.
- Do not introduce a new accent family without documenting its role here and
  in `docs/design-system/colors.md`.

## Typography

- General Sans: UI, navigation, body, and explanatory display copy.
- Bricolage Grotesque: expressive roast headlines, grades, and rare quotes.
- Azeret Mono: metadata, IDs, scores, commit SHAs, and technical evidence.
- Climate Crisis: hero wordmark only.

## Layout and motion

Use the shared 12-column desktop / 4-column mobile grid. Large editorial
stages establish the hierarchy; smaller cards belong inside that structure.
Motion should explain transitions and preserve stable geometry. Prefer opacity
and transform, avoid layout shift, and respect `prefers-reduced-motion`.

## Explicit anti-patterns

- No arbitrary palette mixing inside one profile.
- No red as a full-page background.
- No unnecessary glass header or decorative card frame around an already
  differentiated card.
- No raw color values in new components when an existing semantic token can
  express the role.
