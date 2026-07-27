import type { ScrollToOptions } from 'lenis'
import { usePreferredReducedMotion } from '@vueuse/core'
import { useLenis } from 'lenis/vue'

type ScrollTarget = number | string | HTMLElement

export function useSmoothScroll() {
  const lenis = useLenis()
  const reducedMotion = usePreferredReducedMotion()

  const scrollTo = (target: ScrollTarget, options: ScrollToOptions = {}) => {
    const immediate = options.immediate ?? reducedMotion.value === 'reduce'

    if (lenis.value) {
      lenis.value.scrollTo(target, {
        ...options,
        immediate,
      })
      return
    }

    if (!import.meta.client)
      return

    if (typeof target === 'number') {
      window.scrollTo({
        top: target,
        behavior: immediate ? 'auto' : 'smooth',
      })
      return
    }

    const element = typeof target === 'string'
      ? document.querySelector<HTMLElement>(target)
      : target

    element?.scrollIntoView({
      behavior: immediate ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  const scrollToTop = (options: ScrollToOptions = {}) => {
    scrollTo(0, options)
  }

  const start = () => {
    lenis.value?.start()
  }

  const stop = () => {
    lenis.value?.stop()
  }

  return {
    lenis,
    scrollTo,
    scrollToTop,
    start,
    stop,
  }
}
