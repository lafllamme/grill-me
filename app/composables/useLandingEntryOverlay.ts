const FORCE_SKIP_ENTRY_OVERLAY_IN_DEV = true
const IS_DEV = import.meta.dev

export function useLandingEntryOverlay() {
  const shouldSkipEntryOverlay = IS_DEV && FORCE_SKIP_ENTRY_OVERLAY_IN_DEV
  return useState<boolean>('landing-entry-overlay-visible', () => !shouldSkipEntryOverlay)
}

export function useLandingEntryOverlayRevealChrome() {
  return useState<boolean>('landing-entry-overlay-reveal-chrome', () => false)
}
