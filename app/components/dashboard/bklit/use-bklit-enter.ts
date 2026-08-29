import type { MaybeRefOrGetter } from 'vue'
import { animate, motionValue } from 'motion-v'
import { onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'

export interface BklitEnterOptions {
  type?: 'spring' | 'tween'
  durationSeconds?: number
  ease?: [number, number, number, number]
  stiffness?: number
  damping?: number
  mass?: number
}

export function useBklitEnter(shouldAnimate: boolean, delaySeconds: number, replayKey: MaybeRefOrGetter<string> = '', options: BklitEnterOptions = {}) {
  const progressMotion = motionValue(shouldAnimate ? 0 : 1)
  const progress = ref(progressMotion.get())
  let stop: (() => void) | undefined

  const start = () => {
    stop?.()
    progressMotion.set(shouldAnimate ? 0 : 1)
    if (shouldAnimate) {
      const controls = animate(progressMotion, 1, options.type === 'tween'
        ? { type: 'tween', duration: options.durationSeconds ?? 1.1, ease: options.ease ?? [0.85, 0, 0.15, 1], delay: delaySeconds }
        : { type: 'spring', stiffness: options.stiffness ?? 100, damping: options.damping ?? 15, mass: options.mass ?? 1, delay: delaySeconds })
      stop = () => controls.stop()
    }
  }

  onMounted(() => {
    const unsubscribe = progressMotion.on('change', (value) => {
      progress.value = value
    })
    start()
    onBeforeUnmount(unsubscribe)
  })

  watch(() => toValue(replayKey), start)

  onBeforeUnmount(() => stop?.())

  return progress
}
