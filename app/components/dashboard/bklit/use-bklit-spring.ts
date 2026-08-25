import type { Ref } from 'vue'
import { useMotionValue, useMotionValueEvent, useSpring } from 'motion-v'
import { ref, watch } from 'vue'

export interface BklitSpringConfig {
  stiffness: number
  damping: number
}

const defaultConfig: BklitSpringConfig = { stiffness: 300, damping: 30 }

export function useBklitSpring(target: Ref<number | null>, config: BklitSpringConfig = defaultConfig, initial = 0) {
  const source = useMotionValue(target.value ?? initial)
  const spring = useSpring(source, config)
  const value = ref(spring.get())

  useMotionValueEvent(spring, 'change', (nextValue) => {
    value.value = nextValue
  })

  watch(target, (nextValue) => {
    source.set(nextValue ?? initial)
  }, { immediate: true })

  return value
}
