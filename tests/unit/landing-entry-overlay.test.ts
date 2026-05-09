import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import {
  createEntryOverlayActions,
  ENTRY_OVERLAY_DEFAULT_VISIBLE,
  ENTRY_OVERLAY_NOT_TODAY_URL,
} from '../../app/utils/landing-entry-overlay'

describe('landing entry overlay actions', () => {
  it('defaults overlay visibility to true', () => {
    expect(ENTRY_OVERLAY_DEFAULT_VISIBLE).toBe(true)
  })

  it('closes overlay on continue', () => {
    const isOverlayVisible = ref(true)
    const navigateTo = vi.fn()

    const { onContinue } = createEntryOverlayActions({ isOverlayVisible, navigateTo })
    onContinue()

    expect(isOverlayVisible.value).toBe(false)
  })

  it('navigates to toysrus on not-today', async () => {
    const isOverlayVisible = ref(true)
    const navigateTo = vi.fn().mockResolvedValue(undefined)

    const { onNotToday } = createEntryOverlayActions({ isOverlayVisible, navigateTo })
    await onNotToday()

    expect(navigateTo).toHaveBeenCalledWith(ENTRY_OVERLAY_NOT_TODAY_URL, { external: true })
    expect(isOverlayVisible.value).toBe(true)
  })
})
