<script setup lang="ts">
import type { AnimationItem } from 'lottie-web'
import lottie from 'lottie-web'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits<{ complete: [] }>()
const animationContainer = ref<HTMLElement | null>(null)
const isCurtainExiting = ref(false)
const isFieldReady = ref(false)
const isComplete = ref(false)
const isReducedMotion = ref(false)
let animation: AnimationItem | null = null
let completeTimer: ReturnType<typeof setTimeout> | null = null

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

  const isMobile = window.matchMedia('(max-width: 767px)').matches
  animation = lottie.loadAnimation({
    container: animationContainer.value,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: isMobile ? '/animations/grillme-entrance-mobile.lottie' : '/animations/grillme-entrance.lottie',
    rendererSettings: { preserveAspectRatio: 'xMidYMid slice' },
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
  animation?.destroy()
})
</script>

<template>
  <div
    v-if="!isComplete"
    class="bg-white pointer-events-auto fixed z-[70] inset-0 overflow-hidden"
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
      class="text-white text-center pointer-events-none flex items-center justify-center inset-0 absolute will-change-transform"
      :class="isFieldReady ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.86]'"
      :style="{
        filter: isFieldReady ? 'blur(0)' : 'blur(3px)',
        transition: 'opacity 380ms ease-out, transform 520ms cubic-bezier(0.22, 1, 0.36, 1), filter 440ms ease-out',
      }"
    >
      <p class="text-[clamp(3rem,9vw,8rem)] leading-[0.82] tracking-[-0.075em] font-display font-semibold">
        ARE YOU READY&nbsp;?
      </p>
    </div>
  </div>
</template>
