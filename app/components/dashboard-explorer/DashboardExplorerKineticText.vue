<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  phrases: readonly string[]
  interval?: number
}>(), {
  interval: 2500,
})

interface KineticPose {
  x: number
  y: number
  scale: number
  blur: number
  opacity: number
}

interface KineticController {
  animations: Set<Animation>
  cancelled: boolean
  pendingResolvers: Set<() => void>
  timers: Set<number>
}

const BUILD_EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
const EXIT_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'
const FIRST_WORD_DURATION_MS = 340
const WORD_PUSH_DURATION_MS = 430
const EXIT_DURATION_MS = 260
const EXIT_SETTLE_DELAY_MS = 220
const ENTRY_OFFSET_PX = 88

const stage = ref<HTMLElement | null>(null)
const isReducedMotion = ref(false)
const announcedPhrase = ref(props.phrases[0] ?? '')
const phraseKey = computed(() => props.phrases.join('\u0000'))

let activeController: KineticController | undefined
let reducedMotionQuery: MediaQueryList | undefined

function splitPhrase(phrase: string): string[] {
  return phrase.trim().split(/\s+/).filter(Boolean)
}

function setKineticPose(element: HTMLElement, pose: KineticPose) {
  element.style.filter = `blur(${pose.blur}px)`
  element.style.opacity = `${pose.opacity}`
  element.style.transform = `translate3d(${pose.x}px, ${pose.y}px, 0) scale(${pose.scale})`
}

function animateKineticPose(
  controller: KineticController,
  element: HTMLElement,
  from: KineticPose,
  to: KineticPose,
  duration: number,
  easing: string,
) {
  setKineticPose(element, from)
  const animation = element.animate([
    {
      filter: `blur(${from.blur}px)`,
      opacity: from.opacity,
      transform: `translate3d(${from.x}px, ${from.y}px, 0) scale(${from.scale})`,
    },
    {
      filter: `blur(${to.blur}px)`,
      opacity: to.opacity,
      transform: `translate3d(${to.x}px, ${to.y}px, 0) scale(${to.scale})`,
    },
  ], { duration, easing, fill: 'forwards' })
  controller.animations.add(animation)
  void animation.finished
    .then(() => controller.animations.delete(animation))
    .catch(() => controller.animations.delete(animation))
}

function clearControllerTimers(controller: KineticController) {
  controller.timers.forEach(timer => window.clearTimeout(timer))
  controller.timers.clear()
}

function cleanupController(controller: KineticController) {
  controller.cancelled = true
  clearControllerTimers(controller)
  controller.animations.forEach(animation => animation.cancel())
  controller.animations.clear()
  controller.pendingResolvers.forEach(resolve => resolve())
  controller.pendingResolvers.clear()
}

function schedule(controller: KineticController, callback: () => void, delay: number) {
  if (controller.cancelled)
    return

  const timer = window.setTimeout(() => {
    controller.timers.delete(timer)
    if (!controller.cancelled)
      callback()
  }, delay)
  controller.timers.add(timer)
}

function wait(controller: KineticController, delay: number): Promise<void> {
  if (controller.cancelled || delay <= 0)
    return Promise.resolve()

  return new Promise((resolve) => {
    const finish = () => {
      controller.pendingResolvers.delete(finish)
      resolve()
    }
    controller.pendingResolvers.add(finish)
    schedule(controller, finish, delay)
  })
}

function createWord(document: Document, text: string): HTMLSpanElement {
  const word = document.createElement('span')
  word.className = 'text-lg leading-none tracking-[-0.025em] font-body font-normal flex-none whitespace-nowrap [will-change:transform,opacity,filter] sm:text-xl'
  word.textContent = text
  return word
}

function createController(): KineticController {
  return {
    animations: new Set(),
    cancelled: false,
    pendingResolvers: new Set(),
    timers: new Set(),
  }
}

function renderReducedMotionPhrase(phrase: string) {
  if (!stage.value)
    return

  const fallback = document.createElement('span')
  fallback.className = 'text-lg leading-none tracking-[-0.025em] font-body font-normal sm:text-xl'
  fallback.textContent = phrase
  stage.value.replaceChildren(fallback)
  announcedPhrase.value = phrase
}

async function runReducedMotionCycle(controller: KineticController, phrases: string[]) {
  let phraseIndex = 0

  while (!controller.cancelled) {
    renderReducedMotionPhrase(phrases[phraseIndex] ?? '')
    phraseIndex = (phraseIndex + 1) % phrases.length
    await wait(controller, props.interval)
  }
}

function appendWord(
  controller: KineticController,
  line: HTMLElement,
  words: HTMLSpanElement[],
  text: string,
  duration: number,
) {
  const previousRects = new Map<HTMLSpanElement, DOMRect>()
  words.forEach((word) => {
    previousRects.set(word, word.getBoundingClientRect())
  })

  const word = createWord(line.ownerDocument, text)
  line.appendChild(word)

  words.forEach((currentWord) => {
    const previousRect = previousRects.get(currentWord)
    if (!previousRect)
      return

    const nextRect = currentWord.getBoundingClientRect()
    animateKineticPose(
      controller,
      currentWord,
      { x: previousRect.left - nextRect.left, y: 0, scale: 1, blur: 0, opacity: 1 },
      { x: 0, y: 0, scale: 1, blur: 0, opacity: 1 },
      duration,
      BUILD_EASE,
    )
  })

  animateKineticPose(
    controller,
    word,
    { x: ENTRY_OFFSET_PX, y: 6, scale: 0.992, blur: 3.5, opacity: 0 },
    { x: 0, y: 0, scale: 1, blur: 0, opacity: 1 },
    duration,
    BUILD_EASE,
  )
  words.push(word)
}

async function buildPhrase(controller: KineticController, line: HTMLElement, phraseWords: string[]) {
  const words: HTMLSpanElement[] = []
  line.replaceChildren()

  for (const [index, text] of phraseWords.entries()) {
    if (controller.cancelled)
      return

    if (index > 0)
      await wait(controller, WORD_PUSH_DURATION_MS)

    if (controller.cancelled)
      return

    const duration = index === 0 ? FIRST_WORD_DURATION_MS : WORD_PUSH_DURATION_MS
    appendWord(controller, line, words, text, duration)

    if (index === phraseWords.length - 1)
      await wait(controller, FIRST_WORD_DURATION_MS)
  }
}

async function exitPhrase(controller: KineticController, line: HTMLElement) {
  const words = Array.from(line.children).filter((element): element is HTMLSpanElement => element instanceof HTMLSpanElement)
  if (!words.length || controller.cancelled)
    return

  words.forEach((word) => {
    animateKineticPose(
      controller,
      word,
      { x: 0, y: 0, scale: 1, blur: 0, opacity: 1 },
      { x: 0, y: -6, scale: 1, blur: 2.5, opacity: 0 },
      EXIT_DURATION_MS,
      EXIT_EASE,
    )
  })

  await wait(controller, EXIT_DURATION_MS)
  line.replaceChildren()
  await wait(controller, EXIT_SETTLE_DELAY_MS)
}

async function runKineticBuild(controller: KineticController) {
  const currentStage = stage.value
  const phrases = props.phrases.filter(phrase => splitPhrase(phrase).length > 0)
  if (!currentStage || !phrases.length)
    return

  const line = document.createElement('div')
  line.className = 'relative flex h-full w-full items-center justify-center gap-2.5 lg:justify-start'
  currentStage.replaceChildren(line)

  let phraseIndex = 0
  while (!controller.cancelled) {
    const phrase = phrases[phraseIndex] ?? ''
    announcedPhrase.value = phrase
    await buildPhrase(controller, line, splitPhrase(phrase))
    if (controller.cancelled)
      return

    await wait(controller, props.interval)
    if (controller.cancelled)
      return

    await exitPhrase(controller, line)
    phraseIndex = (phraseIndex + 1) % phrases.length
  }
}

function stopAnimation() {
  if (activeController) {
    cleanupController(activeController)
    activeController = undefined
  }
  stage.value?.replaceChildren()
}

function startAnimation() {
  stopAnimation()

  const phrases = props.phrases.filter(phrase => splitPhrase(phrase).length > 0)
  if (!phrases.length)
    return

  const controller = createController()
  activeController = controller
  if (isReducedMotion.value)
    void runReducedMotionCycle(controller, phrases)
  else
    void runKineticBuild(controller)
}

function updateReducedMotion(event?: MediaQueryListEvent) {
  isReducedMotion.value = event?.matches ?? reducedMotionQuery?.matches ?? false
  if (stage.value)
    startAnimation()
}

onMounted(() => {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  isReducedMotion.value = reducedMotionQuery.matches
  reducedMotionQuery.addEventListener('change', updateReducedMotion)
  startAnimation()
})

watch(phraseKey, () => {
  if (stage.value)
    startAnimation()
})

onBeforeUnmount(() => {
  reducedMotionQuery?.removeEventListener('change', updateReducedMotion)
  stopAnimation()
})
</script>

<template>
  <div
    class="h-24 relative overflow-hidden sm:h-28"
    data-testid="dashboard-loading-process"
    role="status"
    aria-live="polite"
    :aria-label="announcedPhrase"
  >
    <div ref="stage" class="h-full w-full" aria-hidden="true" />
    <span class="sr-only">{{ announcedPhrase }}</span>
  </div>
</template>
