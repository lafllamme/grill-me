import type { MaybeRefOrGetter } from 'vue'
import { animate, motionValue } from 'motion-v'
import { onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'

export function useBklitEnter(shouldAnimate: boolean, delaySeconds: number, replayKey: MaybeRefOrGetter<string> = '', options: { type?: 'spring' | 'tween', durationSeconds?: number } = {}) {
  const progressMotion = motionValue(shouldAnimate ? 0 : 1)
  const progress = ref(progressMotion.get())
  let stop: (() => void) | undefined

  const start = () => {
    stop?.()
    progressMotion.set(shouldAnimate ? 0 : 1)
    if (shouldAnimate) {
      const controls = animate(progressMotion, 1, options.type === 'tween'
        ? { type: 'tween', duration: options.durationSeconds ?? 1.1, ease: [0.85, 0, 0.15, 1], delay: delaySeconds }
        : { type: 'spring', stiffness: 100, damping: 15, mass: 1, delay: delaySeconds })
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
