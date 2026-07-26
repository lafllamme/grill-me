import { computed } from 'vue'
import { useCookie, useState } from '#imports'

export function useLandingEntryOverlay() {
  const hasEnteredThisSession = useCookie<boolean>('grillme-entry-confirmed', {
    default: () => false,
    sameSite: 'lax',
  })

  return computed({
    get: () => !hasEnteredThisSession.value,
    set: (isVisible: boolean) => {
      hasEnteredThisSession.value = !isVisible
    },
  })
}

export function useLandingEntryOverlayRevealChrome() {
  return useState<boolean>('landing-entry-overlay-reveal-chrome', () => false)
}
