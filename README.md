# GrillMe

GrillMe is an evidence-backed roast for public GitHub code. It turns repository structure, history, and concrete engineering signals into sharp, explainable feedback.

> Work in progress. The product and scoring model are still evolving.

## What it does

- Reviews public GitHub repositories and profiles.
- Presents findings as readable evidence instead of a single unexplained score.
- Explores repository health through dashboards, timelines, profile signals, and roast views.
- Supports shareable results and a leaderboard-oriented review flow.
- Uses a theatrical visual system while keeping the underlying analysis technically grounded.

## Tech stack

- Nuxt 4 and Vue 3
- TypeScript
- Pinia and VueUse
- UnoCSS
- Three.js / TresJS and WebGL-based visual scenes
- Motion and Lottie for interaction and transitions
- Vitest and Playwright for automated checks

## Getting started

### Requirements

- Node.js with Corepack enabled
- pnpm 10

### Installation

```bash
corepack enable
pnpm install
```

### Development

```bash
pnpm dev
```

The development server runs at `http://localhost:3000`.

## Useful commands

```bash
pnpm build             # Build for production
pnpm preview           # Preview the production build
pnpm lint              # Run ESLint
pnpm typecheck         # Run Nuxt type checking
pnpm test:unit         # Run unit tests
pnpm test:e2e          # Run Playwright tests
pnpm test:all          # Run unit and end-to-end tests
pnpm check             # Run lint, typecheck, unit, and end-to-end checks
```

Install the Playwright browsers once before running end-to-end tests:

```bash
pnpm test:e2e:install
```

## Project structure

```text
app/
├── components/    # Landing, roast, dashboard, chart, and scene components
├── composables/   # Shared analysis, auth, animation, and view-model logic
├── pages/         # Landing, dashboard, roast, leaderboard, docs, and share views
├── constants/     # Shared product and scoring constants
└── assets/        # Styles, audio, models, and other visual assets

docs/              # Product, architecture, scoring, design, and testing notes
tests/             # Automated test suites
```

## Design direction

GrillMe uses a dark, editorial interface with warm contrast and a single signal-red accent. Surface contrast carries most of the hierarchy; motion supports transitions without creating layout shift, and reduced-motion preferences are respected.

The repository keeps the product rules in `DESIGN.md` and the engineering conventions in `AGENTS.md`.

## Status

The application is under active development. Expect incomplete flows, evolving analysis rules, and UI experiments while the product is being shaped.

## License

No open-source license has been declared yet. Until a license is added, reuse and redistribution are not granted by default.

Made with love by [Laflamme](https://github.com/lafllamme).
