import type { MaybeRefOrGetter, Ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { ref, toValue, watch } from 'vue'

export function usePacedRoastStatuses(statuses: MaybeRefOrGetter<string[]>, interval = 700): Ref<string[]> {
  const displayedStatuses = ref<string[]>([])
  let sourceIndex = 0
  let pausePacing = () => {}

  const revealNext = () => {
    const source = toValue(statuses)
    const nextStatus = source[sourceIndex]

    if (!nextStatus) {
      pausePacing()
      return
    }

    displayedStatuses.value.push(nextStatus)
    sourceIndex += 1

    if (sourceIndex >= source.length)
      pausePacing()
  }

  const { pause, resume } = useIntervalFn(revealNext, interval, { immediate: false })
  pausePacing = pause

  watch(() => toValue(statuses).length, (length, previousLength) => {
    if (previousLength !== undefined && length < previousLength) {
      pause()
      displayedStatuses.value = []
      sourceIndex = 0
    }

    if (length === 0)
      return

    if (sourceIndex === 0)
      revealNext()

    if (sourceIndex < length)
      resume()
  }, { immediate: true })

  return displayedStatuses
}
