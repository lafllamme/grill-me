<script setup lang="ts">
import type { BklitRingContext, BklitRingData } from './ring-context'
import { computed, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { bklitRingContextKey, createProgressPath, createRingPaths } from './ring-context'

const props = withDefaults(defineProps<{
  data: readonly BklitRingData[]
  size?: number
  strokeWidth?: number
  ringGap?: number
  baseInnerRadius?: number
  startAngle?: number
  endAngle?: number
}>(), {
  size: 220,
  strokeWidth: 12,
  ringGap: 6,
  baseInnerRadius: 60,
  startAngle: -Math.PI / 2,
  endAngle: (3 * Math.PI) / 2,
})

const hoveredIndex = ref<number | null>(null)
const isEntered = ref(false)
let entranceTimer: ReturnType<typeof setTimeout> | undefined
let hoverClearTimer: ReturnType<typeof setTimeout> | undefined
let hoverSetTimer: ReturnType<typeof setTimeout> | undefined
const outerRadius = computed(() => props.baseInnerRadius + (props.data.length - 1) * (props.strokeWidth + props.ringGap) + props.strokeWidth)
const ringPaths = computed(() => createRingPaths({
  data: props.data,
  outerRadius: outerRadius.value,
  ringGap: props.ringGap,
  strokeWidth: props.strokeWidth,
  startAngle: props.startAngle,
  endAngle: props.endAngle,
}))

const context: BklitRingContext = {
  data: props.data,
  hoveredIndex,
  setHoveredIndex: (index) => {
    if (hoverClearTimer) {
      clearTimeout(hoverClearTimer)
      hoverClearTimer = undefined
    }
    if (hoveredIndex.value === index) {
      return
    }
    if (hoverSetTimer) {
      clearTimeout(hoverSetTimer)
    }
    hoverSetTimer = setTimeout(() => {
      hoveredIndex.value = index
      hoverSetTimer = undefined
    }, 50)
  },
  clearHoveredIndex: () => {
    if (hoverClearTimer) {
      clearTimeout(hoverClearTimer)
    }
    if (hoverSetTimer) {
      clearTimeout(hoverSetTimer)
      hoverSetTimer = undefined
    }
    hoverClearTimer = setTimeout(() => {
      hoveredIndex.value = null
      hoverClearTimer = undefined
    }, 120)
  },
  isEntered,
  getRingColor: index => props.data[index]?.color ?? 'currentColor',
  getRingPath: index => ringPaths.value[index] ?? { backgroundPath: '', progressPath: '' },
  getProgressPath: (index, progress) => {
    const item = props.data[index]
    return item ? createProgressPath({ item, index, progress, outerRadius: outerRadius.value, ringGap: props.ringGap, strokeWidth: props.strokeWidth, startAngle: props.startAngle, endAngle: props.endAngle }) : ''
  },
}

provide(bklitRingContextKey, context)

onMounted(() => {
  entranceTimer = setTimeout(() => {
    isEntered.value = true
  }, 1200)
})

onBeforeUnmount(() => {
  if (entranceTimer) {
    clearTimeout(entranceTimer)
  }
  if (hoverClearTimer) {
    clearTimeout(hoverClearTimer)
  }
  if (hoverSetTimer) {
    clearTimeout(hoverSetTimer)
  }
})
</script>

<template>
  <div class="relative shrink-0" :style="{ width: `${props.size}px`, height: `${props.size}px` }">
    <svg class="h-full w-full overflow-visible" :viewBox="`0 0 ${props.size} ${props.size}`" role="img" aria-label="Code quality profile">
      <g :transform="`translate(${props.size / 2} ${props.size / 2})`">
        <slot />
      </g>
    </svg>
    <div class="pointer-events-none inset-0 absolute">
      <slot name="center" />
    </div>
    <slot name="legend" />
  </div>
</template>
