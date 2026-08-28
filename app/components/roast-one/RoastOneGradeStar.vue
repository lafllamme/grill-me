<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

withDefaults(defineProps<{
  grade: string
  size?: 'sm' | 'md' | 'lg'
  gradeSize?: 'xs' | 'sm' | 'md'
  tone?: 'dark' | 'light'
}>(), {
  size: 'md',
  gradeSize: 'sm',
  tone: 'dark',
})

const starFillPercent = ref(0)
const starRotation = ref(-8)
const isGradeVisible = ref(false)
let animationFrame: number | undefined

const starClipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    starFillPercent.value = 100
    starRotation.value = 0
    isGradeVisible.value = true
    return
  }

  const startedAt = performance.now()
  const duration = 1400

  const animate = (now: number) => {
    const progress = Math.min((now - startedAt) / duration, 1)
    const eased = 1 - ((1 - progress) ** 3)

    starFillPercent.value = eased * 100
    starRotation.value = -8 + (8 * eased)

    if (progress < 1) {
      animationFrame = requestAnimationFrame(animate)
      return
    }

    isGradeVisible.value = true
  }

  animationFrame = requestAnimationFrame(animate)
})

onBeforeUnmount(() => {
  if (animationFrame !== undefined) {
    cancelAnimationFrame(animationFrame)
  }
})

const sizeClasses = {
  sm: 'h-20 w-20 text-2xl',
  md: 'h-28 w-28 text-4xl',
  lg: 'h-40 w-40 text-5xl',
} as const

const gradeSizeClasses = {
  xs: 'text-xl',
  sm: 'text-2xl',
  md: 'text-4xl',
} as const
</script>

<template>
  <div
    class="relative flex items-center justify-center"
    data-testid="roast-one-grade-star"
    :class="sizeClasses[size]"
  >
    <div
      class="inset-0 absolute transition-transform duration-1000 ease-out motion-reduce:transition-none"
      role="img"
      :aria-label="`Grade ${grade}`"
      :style="{ transform: `rotate(${starRotation}deg)`, clipPath: starClipPath }"
    >
      <div
        class="h-full w-full"
        :class="tone === 'light' ? 'bg-basalt-200' : 'bg-surface-container-highest'"
      />
      <div
        class="inset-0 absolute overflow-hidden transition-[clip-path] duration-1000 ease-out motion-reduce:transition-none"
        :style="{ clipPath: `inset(${100 - starFillPercent}% 0 0 0)` }"
      >
        <div
          class="h-full w-full bg-primary"
          :style="{ clipPath: starClipPath }"
        />
      </div>
    </div>
    <span
      class="font-display relative z-10 transition-all duration-700 motion-reduce:transition-none"
      :class="[
        tone === 'light' ? 'text-basalt-950' : 'text-background',
        gradeSizeClasses[gradeSize],
        isGradeVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
      ]"
    >
      {{ grade }}
    </span>
  </div>
</template>
