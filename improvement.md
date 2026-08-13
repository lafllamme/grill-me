# Homepage Improvement Plan

Temporary working document for the Grillme homepage performance, scroll-feel, and motion pass.

Created: 2026-08-13
Reference commit: `6b1dfe2 feat: refine velocity marquee motion`

## Goal

Make the homepage feel as calm, continuous, and responsive as the Fuel reference while preserving the current Grillme composition, visual language, and interactive behavior.

The target is not maximum animation or maximum frame rate in isolation. The target is a coherent scroll system: one clear source of scroll truth, predictable motion, no visible stutter, and no unnecessary work while content is off-screen.

## Working rules

- Measure before changing motion behavior.
- Keep the existing Fuel-inspired composition and Grillme palette.
- Prefer transforms and opacity for animated UI.
- Prefer native CSS scroll/view timelines for simple reveal effects.
- Keep Motion-V for intentional choreography that needs sequencing.
- Keep one shared scroll source wherever possible.
- Pause continuous work outside the viewport.
- Preserve `prefers-reduced-motion` behavior.
- Validate desktop and mobile after every performance pass.

## Checklist

### 1. Baseline and instrumentation

- [x] Record a production-like local build baseline.
- [ ] Record desktop and mobile viewport baselines.
- [ ] Measure initial load: TTFB, FCP, LCP, CLS, hydration, and first interaction.
- [ ] Profile a slow scroll through the complete homepage.
- [ ] Profile a fast scroll through the complete homepage.
- [ ] Record long tasks, dropped frames, layout, paint, and composite activity.
- [ ] Count active RAF loops, CSS animations, WebGL canvases, and scroll listeners.
- [ ] Record the same scroll passes with reduced motion enabled.
- [ ] Compare local observations against Fuel's section transitions and motion density.

Current findings:

- Fuel was inspected in a real browser from hero through footer.
- Fuel's dominant motion is linear and section-based, with most simple reveals driven by native scroll/view timelines.
- The local page currently combines Lenis, Motion-V, CSS scroll timelines, the Marquee RAF loop, and Prism WebGL rendering.
- The local Marquee is visible-only, but its position is still updated through Vue reactivity on every frame.
- Prism is the main continuous rendering workload in the opening stage.
- Production build completed successfully with Nuxt 4.4.2 / Vite 7.3.2.
- Initial client output includes chunks around `430 kB` and `268 kB` uncompressed; investigate ownership before splitting.
- Build reports the existing `lottie-web` third-party `eval` warning; do not treat it as a homepage regression without tracing its runtime use.
- Browser smoke check confirms both marquee tracks update continuously through inline transforms while visible.

### 2. Scroll architecture

- [ ] Make Lenis the canonical scroll source for JS-driven motion.
- [ ] Remove duplicate reactive scroll tracking where Lenis data can be reused.
- [ ] Define which effects are native CSS timeline effects and which require JS.
- [ ] Prevent multiple systems from competing over the same transform.
- [ ] Verify that anchor navigation and entrance scroll locking still work.

### 3. Marquee performance and feel

- [x] Move per-frame transforms from Vue refs to direct DOM style updates.
- [x] Use one shared frame controller for both rows.
- [x] Keep the marquee paused when it is outside the viewport.
- [ ] Preserve the eight-copy seamless fill without unnecessary component updates.
- [ ] Smooth scroll direction changes without visible stutter.
- [ ] Tune base velocity and scroll boost against the NXUI reference.
- [ ] Test slow wheel, fast wheel, trackpad, touch, and reverse scrolling.

### 4. Prism/WebGL workload

- [ ] Pause Prism when the hero/target stage is outside the viewport.
- [ ] Confirm inactive-tab pausing and context-loss recovery.
- [ ] Verify the internal DPR and FPS caps on desktop and mobile.
- [ ] Reduce or disable rendering when the page is visually covered by the entrance layer.
- [ ] Check whether shader settings create avoidable GPU spikes.
- [ ] Confirm the WebGL canvas is not mounted more than once.

### 5. Reveal and section choreography

- [ ] Use CSS view timelines for simple list, archive, stats, and card reveals.
- [ ] Keep Motion-V for hero sequencing and complex one-shot choreography.
- [ ] Reduce simultaneous opacity, blur, scale, and transform changes.
- [ ] Align reveal ranges and easing across sections.
- [ ] Check chapter covers and diagonal transitions for layout/paint cost.
- [ ] Preserve the Fuel-like linear, calm progression between sections.

### 6. Sticky and parallax layers

- [ ] Audit every sticky layer and remove unnecessary overlap.
- [ ] Verify parallax layers do not trigger layout work.
- [ ] Keep `will-change` only on elements that are actively moving.
- [ ] Check the sticky portfolio/levels compositions on mobile.

### 7. Responsive and accessibility pass

- [ ] Test 1280px, 1440px, mobile width, and reduced-motion mode.
- [ ] Check marquee overflow and full-bleed alignment at every breakpoint.
- [ ] Check text wrapping after performance-related DOM changes.
- [ ] Confirm hidden duplicate marquee copies remain inaccessible to assistive technology.
- [ ] Confirm keyboard navigation and anchor links remain stable.

### 8. Validation and handoff

- [ ] Re-run the baseline measurements.
- [ ] Compare before/after frame-time and long-task results.
- [ ] Run lint, typecheck, unit tests, and relevant E2E tests.
- [ ] Perform a final browser pass against Fuel.
- [ ] Record final motion defaults and performance decisions in the design-system docs.
- [ ] Remove this temporary file once the plan is completed or migrate the durable decisions into `docs/design-system/`.

## Execution order

1. Finish the baseline measurements.
2. Optimize the Marquee's frame updates.
3. Unify Lenis as the JS scroll source.
4. Optimize Prism's visibility and render lifecycle.
5. Consolidate simple reveals onto CSS timelines.
6. Audit sticky/parallax compositing.
7. Run responsive and reduced-motion checks.
8. Re-measure, test, document, and remove this temporary plan.

## Current status

The plan is created. The production build baseline is complete and the first Marquee optimization is implemented. Runtime profiling is next.

## Completed in this pass

- Marquee frame transforms now write directly to the two rendered track elements, avoiding a Vue render dependency on every animation frame.
- The existing single RAF loop still drives both rows.
- The loop remains paused outside the viewport, and its timestamp is reset on visibility changes so re-entry cannot produce a long-frame jump.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed with 26 pre-existing UnoCSS ordering warnings and no errors.
- `pnpm test:unit` passed: 48 tests.
- `pnpm test:e2e` passed 9/13 tests. The four failures are existing copy/entrance-selector mismatches; none points to the marquee implementation.
