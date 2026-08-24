import type { Ref } from 'vue'
import { onBeforeUnmount, ref, watch } from 'vue'

export function useBklitSpring(target: Ref<number | null>, initial = 0) {
  const value = ref(target.value ?? initial)
  let frame: number | null = null
  let velocity = 0

  const stop = () => {
    if (frame !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(frame)
    }
    frame = null
  }

  const animate = () => {
    if (typeof requestAnimationFrame === 'undefined') {
      value.value = target.value ?? initial
      return
    }
    const destination = target.value ?? initial
    const distance = destination - value.value
    velocity = velocity * 0.78 + distance * 0.22
    value.value += velocity
    if (Math.abs(distance) < 0.08 && Math.abs(velocity) < 0.08) {
      value.value = destination
      stop()
      return
    }
    frame = requestAnimationFrame(animate)
  }

  watch(target, () => {
    if (typeof requestAnimationFrame !== 'undefined' && frame === null) {
      frame = requestAnimationFrame(animate)
    }
  }, { immediate: true })

  onBeforeUnmount(stop)
  return value
}
