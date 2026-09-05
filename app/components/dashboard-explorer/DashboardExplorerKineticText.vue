<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface KineticBuildOptions {
  firstWordDurationMs: number
  pushDurationMs: number
  exitDurationMs: number
  holdMs?: number
  betweenPhrasesMs?: number
  entryOffsetPx: number
  wordGapPx: number
  firstWordYPx: number
  entryScale: number
  entryBlurPx: number
  reflowBlurPx: number
  exitYPx: number
  exitBlurPx: number
  easing: string
  exitEasing: string
}

interface KineticRuntimeOptions {
  speed: number
  holdMs: number
  gapMs: number
  yTravel: number
}

type KineticFrame = Keyframe

interface KineticController {
  animations: Set<Animation>
  cancelled: boolean
  pendingResolvers: Set<() => void>
  timers: Set<number>
}

const props = defineProps<{
  phrases: readonly string[]
  build?: Partial<KineticBuildOptions>
  speed?: number
  holdMs?: number
  gapMs?: number
  yTravel?: number
}>()

const DEFAULT_KINETIC_RUNTIME: KineticRuntimeOptions = {
  speed: 0.72,
  holdMs: 550,
  gapMs: 320,
  yTravel: 0.58,
}

const DEFAULT_KINETIC_BUILD: KineticBuildOptions = {
  firstWordDurationMs: 340,
  pushDurationMs: 430,
  exitDurationMs: 260,
  entryOffsetPx: 88,
  wordGapPx: 10,
  firstWordYPx: 6,
  entryScale: 0.992,
  entryBlurPx: 3.5,
  reflowBlurPx: 0.8,
  exitYPx: -6,
  exitBlurPx: 2.5,
  easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  exitEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
}

const stage = ref<HTMLElement | null>(null)
const isReducedMotion = ref(false)
const runtime = computed<KineticRuntimeOptions>(() => ({
  speed: props.speed ?? DEFAULT_KINETIC_RUNTIME.speed,
  holdMs: props.holdMs ?? DEFAULT_KINETIC_RUNTIME.holdMs,
  gapMs: props.gapMs ?? DEFAULT_KINETIC_RUNTIME.gapMs,
  yTravel: props.yTravel ?? DEFAULT_KINETIC_RUNTIME.yTravel,
}))
const build = computed<KineticBuildOptions>(() => ({
  ...DEFAULT_KINETIC_BUILD,
  ...props.build,
}))
const accessiblePhrase = computed(() => props.phrases[0] ?? '')
const phraseKey = computed(() => props.phrases.join('\u0000'))

let activeController: KineticController | undefined
let reducedMotionQuery: MediaQueryList | undefined

function splitPhrase(phrase: string): string[] {
  return phrase.trim().split(/\s+/).filter(Boolean)
}

function mix(from: number, to: number, progress: number): number {
  return from + (to - from) * progress
}

function buildKineticFrame(
  x: number,
  y: number,
  scale: number,
  blur: number,
  opacity: number,
): KineticFrame {
  return {
    filter: `blur(${blur}px)`,
    opacity,
    transform: `translate(-50%, -50%) translate3d(${x}px, ${y * runtime.value.yTravel}px, 0) scale(${scale})`,
  }
}

function setKineticPose(element: HTMLElement, frame: KineticFrame) {
  element.style.filter = typeof frame.filter === 'string' ? frame.filter : ''
  element.style.opacity = `${frame.opacity ?? 1}`
  element.style.transform = typeof frame.transform === 'string' ? frame.transform : ''
}

function registerAnimation(controller: KineticController, animation: Animation): Animation {
  controller.animations.add(animation)
  void animation.finished.then(() => controller.animations.delete(animation)).catch(() => controller.animations.delete(animation))
  return animation
}

function waitForAnimations(animations: Animation[]) {
  return Promise.all(animations.map(animation => animation.finished.catch(() => undefined)))
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

function sleep(controller: KineticController, delay: number): Promise<void> {
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

function computePositions(widths: number[], wordGapPx: number): number[] {
  const total = widths.reduce((sum, width) => sum + width, 0) + wordGapPx * Math.max(0, widths.length - 1)
  let cursor = -total / 2

  return widths.map((width) => {
    const position = cursor + width / 2
    cursor += width + wordGapPx
    return position
  })
}

function createWord(document: Document, text: string): HTMLSpanElement {
  const word = document.createElement('span')
  word.className = 'text-xl leading-none tracking-[-0.025em] font-body font-normal absolute left-1/2 top-1/2 whitespace-nowrap [will-change:transform,opacity,filter] sm:text-2xl'
  word.textContent = text
  return word
}

async function runKineticBuild(controller: KineticController) {
  const currentStage = stage.value
  const phrases = props.phrases.map(splitPhrase).filter(phrase => phrase.length > 0)
  if (!currentStage || !phrases.length)
    return

  const line = document.createElement('div')
  line.className = 'relative flex h-full w-full items-center justify-center'
  currentStage.replaceChildren(line)

  const firstWordDuration = Math.max(180, Math.round(build.value.firstWordDurationMs * runtime.value.speed))
  const pushDuration = Math.max(180, Math.round(build.value.pushDurationMs * runtime.value.speed))
  const exitDuration = Math.max(140, Math.round(build.value.exitDurationMs * runtime.value.speed))
  const holdDuration = Math.max(380, Math.round((build.value.holdMs ?? runtime.value.holdMs) * runtime.value.speed))
  const betweenPhrasesDuration = Math.max(120, Math.round((build.value.betweenPhrasesMs ?? runtime.value.gapMs) * runtime.value.speed))
  let phraseIndex = 0
  let words: HTMLSpanElement[] = []
  let positions: number[] = []

  const buildPhrase = async (phraseWords: string[]) => {
    line.replaceChildren()
    words = []
    positions = []

    for (const [index, text] of phraseWords.entries()) {
      if (controller.cancelled)
        return

      const word = createWord(currentStage.ownerDocument, text)
      line.appendChild(word)
      const widths = Array.from(line.children, child => (child as HTMLElement).offsetWidth)
      const nextPositions = computePositions(widths, build.value.wordGapPx)
      const animations: Animation[] = []

      if (index === 0) {
        const start = buildKineticFrame(0, build.value.firstWordYPx, build.value.entryScale, build.value.entryBlurPx, 0)
        setKineticPose(word, start)
        animations.push(registerAnimation(controller, word.animate([
          start,
          {
            ...buildKineticFrame(0, build.value.firstWordYPx * 0.35, 0.998, build.value.entryBlurPx * 0.45, 0.78),
            offset: 0.58,
          },
          buildKineticFrame(0, 0, 1, 0, 1),
        ], { duration: firstWordDuration, easing: build.value.easing, fill: 'forwards' })))
      }
      else {
        words.forEach((currentWord, wordIndex) => {
          const currentPosition = positions[wordIndex]!
          const nextPosition = nextPositions[wordIndex]!
          animations.push(registerAnimation(controller, currentWord.animate([
            buildKineticFrame(currentPosition, 0, 1, 0, 1),
            {
              ...buildKineticFrame(mix(currentPosition, nextPosition, 0.58), 0, 1, build.value.reflowBlurPx, 1),
              offset: 0.52,
            },
            buildKineticFrame(nextPosition, 0, 1, 0, 1),
          ], { duration: pushDuration, easing: build.value.easing, fill: 'forwards' })))
        })

        const targetPosition = nextPositions[index]!
        const startPosition = targetPosition + build.value.entryOffsetPx
        const start = buildKineticFrame(startPosition, 0, build.value.entryScale, build.value.entryBlurPx, 0)
        setKineticPose(word, start)
        animations.push(registerAnimation(controller, word.animate([
          start,
          {
            ...buildKineticFrame(mix(startPosition, targetPosition, 0.72), 0, 0.998, build.value.entryBlurPx * 0.38, 0.84),
            offset: 0.6,
          },
          buildKineticFrame(targetPosition, 0, 1, 0, 1),
        ], { duration: pushDuration, easing: build.value.easing, fill: 'forwards' })))
      }

      await waitForAnimations(animations)
      if (controller.cancelled)
        return

      nextPositions.forEach((position, wordIndex) => {
        const currentWord = wordIndex === words.length ? word : words[wordIndex]!
        setKineticPose(currentWord, buildKineticFrame(position, 0, 1, 0, 1))
      })
      words.push(word)
      positions = nextPositions
    }
  }

  const exitPhrase = async () => {
    if (!words.length || controller.cancelled)
      return

    const animations = words.map((word, index) => {
      const position = positions[index]!
      return registerAnimation(controller, word.animate([
        buildKineticFrame(position, 0, 1, 0, 1),
        {
          ...buildKineticFrame(position, build.value.exitYPx * 0.45, 1, build.value.exitBlurPx * 0.55, 0.62),
          offset: 0.52,
        },
        buildKineticFrame(position, build.value.exitYPx, 1, build.value.exitBlurPx, 0),
      ], { duration: exitDuration, easing: build.value.exitEasing, fill: 'forwards' }))
    })

    await waitForAnimations(animations)
    line.replaceChildren()
    words = []
    positions = []
  }

  while (!controller.cancelled) {
    await buildPhrase(phrases[phraseIndex] ?? phrases[0]!)
    await sleep(controller, holdDuration)
    if (controller.cancelled)
      break
    await exitPhrase()
    await sleep(controller, betweenPhrasesDuration)
    phraseIndex = (phraseIndex + 1) % phrases.length
  }
}

function renderReducedMotionFallback() {
  if (!stage.value)
    return

  const fallback = document.createElement('span')
  fallback.className = 'text-xl leading-none tracking-[-0.025em] font-body font-normal text-center sm:text-2xl'
  fallback.textContent = accessiblePhrase.value
  stage.value.replaceChildren(fallback)
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
  if (isReducedMotion.value) {
    renderReducedMotionFallback()
    return
  }

  const controller: KineticController = {
    animations: new Set(),
    cancelled: false,
    pendingResolvers: new Set(),
    timers: new Set(),
  }
  activeController = controller
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
    :aria-label="accessiblePhrase"
  >
    <div ref="stage" class="h-full w-full" aria-hidden="true" />
    <span class="sr-only">{{ accessiblePhrase }}</span>
  </div>
</template>
