<script setup lang="ts">
import type { AnimationItem } from 'lottie-web'
import lottie from 'lottie-web'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits<{ complete: [] }>()
const animationContainer = ref<HTMLElement | null>(null)
const isCurtainExiting = ref(false)
const isFieldReady = ref(false)
const isMessageVisible = ref(false)
const isComplete = ref(false)
const isReducedMotion = ref(false)
let animation: AnimationItem | null = null
let completeTimer: ReturnType<typeof setTimeout> | null = null
let messageTimer: ReturnType<typeof setTimeout> | null = null

async function finish(): Promise<void> {
  if (isCurtainExiting.value)
    return
  await nextTick()
  isCurtainExiting.value = true
}

function revealFieldMessage(): void {
  if (isFieldReady.value)
    return

  isFieldReady.value = true
  messageTimer = setTimeout(() => {
    isMessageVisible.value = true
  }, 360)
}

function handleCurtainTransitionEnd(event: TransitionEvent): void {
  if (event.propertyName === 'transform') {
    isComplete.value = true
    emit('complete')
  }
}

onMounted(() => {
  isReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (isReducedMotion.value) {
    isComplete.value = true
    emit('complete')
    return
  }

  if (!animationContainer.value)
    return

  animation = lottie.loadAnimation({
    container: animationContainer.value,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: '/animations/grillme-window.json',
    rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
  })

  animation.addEventListener('complete', () => {
    completeTimer = setTimeout(() => void finish(), 520)
  })

  animation.addEventListener('enterFrame', () => {
    if (animation && animation.currentFrame >= animation.totalFrames * 0.62)
      revealFieldMessage()
  })
})

onBeforeUnmount(() => {
  if (completeTimer)
    clearTimeout(completeTimer)
  if (messageTimer)
    clearTimeout(messageTimer)
  animation?.destroy()
})
</script>

<template>
  <div
    v-if="!isComplete"
    class="bg-explore-signal-deep pointer-events-auto fixed z-[70] inset-0 overflow-hidden"
    :style="{
      transform: isCurtainExiting ? 'translateY(-100%)' : 'translateY(0)',
      transition: isReducedMotion ? 'none' : 'transform 900ms cubic-bezier(0.76, 0, 0.24, 1)',
    }"
    aria-hidden="true"
    data-testid="landing-entrance-preloader"
    @transitionend="handleCurtainTransitionEnd"
  >
    <div ref="animationContainer" class="h-full w-full" />

    <div
      class="text-center pointer-events-none flex items-center justify-center inset-0 absolute will-change-transform"
      :class="isFieldReady ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.96]'"
      :style="{
        filter: isFieldReady ? 'blur(0)' : 'blur(3px)',
        transition: 'opacity 380ms ease-out, transform 520ms cubic-bezier(0.22, 1, 0.36, 1), filter 440ms ease-out',
      }"
    >
      <div class="relative overflow-hidden px-[clamp(1rem,3vw,3rem)] py-[clamp(0.75rem,2vw,1.5rem)]">
        <div
          class="bg-explore-ink/92 border-[1px] border-explore-signal-bright/45 shadow-[0_18px_50px_rgba(8,7,8,0.24)] absolute inset-0 will-change-[clip-path]"
          :style="{
            clipPath: isFieldReady ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
            transition: 'clip-path 520ms cubic-bezier(0.22, 1, 0.36, 1)',
          }"
        />
        <p
          class="text-explore-copy relative text-[clamp(2.5rem,8vw,7rem)] leading-[0.82] tracking-[-0.075em] font-display font-semibold will-change-transform"
          :class="isMessageVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'"
          :style="{ transition: 'opacity 180ms ease-out, transform 220ms cubic-bezier(0.22, 1, 0.36, 1)' }"
        >
          ARE YOU READY&nbsp;?
        </p>
      </div>
    </div>
  </div>
</template>
