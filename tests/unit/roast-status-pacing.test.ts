import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { usePacedRoastStatuses } from '../../app/composables/usePacedRoastStatuses'

describe('roast status pacing', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('reveals the first status immediately and queues simultaneous updates', async () => {
    vi.useFakeTimers()
    const statuses = ref<string[]>([])
    const displayedStatuses = usePacedRoastStatuses(statuses, 700)

    statuses.value = ['fetching', 'selecting', 'building']
    await nextTick()

    expect(displayedStatuses.value).toEqual(['fetching'])

    await vi.advanceTimersByTimeAsync(700)
    expect(displayedStatuses.value).toEqual(['fetching', 'selecting'])

    await vi.advanceTimersByTimeAsync(700)
    expect(displayedStatuses.value).toEqual(['fetching', 'selecting', 'building'])
  })
})
