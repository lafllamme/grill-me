import type { Ref } from 'vue'

export const ENTRY_OVERLAY_DEFAULT_VISIBLE = true
export const ENTRY_OVERLAY_NOT_TODAY_URL = 'https://www.toysrus.com'

export interface EntryOverlayActions {
  isOverlayVisible: Ref<boolean>
  navigateTo: (to: string, options?: { external?: boolean }) => unknown | Promise<unknown>
}

export function createEntryOverlayActions({ isOverlayVisible, navigateTo }: EntryOverlayActions) {
  const onContinue = (): void => {
    isOverlayVisible.value = false
  }

  const onNotToday = async (): Promise<void> => {
    await navigateTo(ENTRY_OVERLAY_NOT_TODAY_URL, { external: true })
  }

  return {
    onContinue,
    onNotToday,
  }
}
