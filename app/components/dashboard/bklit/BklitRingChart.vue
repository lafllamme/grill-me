<script setup lang="ts">
import type { BklitRingContext, BklitRingData } from './ring-context'
import { computed, onBeforeUnmount, provide, ref } from 'vue'
import { bklitRingContextKey, createProgressPath, createRingPaths } from './ring-context'

const props = withDefaults(defineProps<{
  data: readonly BklitRingData[]
  size?: number
  strokeWidth?: number
  ringGap?: number
  baseInnerRadius?: number
  enterStaggerScale?: number
  startAngle?: number
  endAngle?: number
}>(), {
  size: 220,
  strokeWidth: 12,
  ringGap: 6,
  baseInnerRadius: 60,
  startAngle: -Math.PI / 2,
  endAngle: (3 * Math.PI) / 2,
  enterStaggerScale: 1,
})

const hoveredIndex = ref<number | null>(null)
let hoverClearTimer: ReturnType<typeof setTimeout> | undefined

onBeforeUnmount(() => {
  if (hoverClearTimer) {
    clearTimeout(hoverClearTimer)
  }
})
const center = computed(() => props.size / 2)
const designOuterRadius = computed(() => props.baseInnerRadius + Math.max(props.data.length - 1, 0) * (props.strokeWidth + props.ringGap) + props.strokeWidth)
const geometryScale = computed(() => Math.min(1, (center.value - 8) / designOuterRadius.value))
const scaledStrokeWidth = computed(() => props.strokeWidth * geometryScale.value)
const scaledRingGap = computed(() => props.ringGap * geometryScale.value)
const scaledBaseInnerRadius = computed(() => props.baseInnerRadius * geometryScale.value)
const ringPaths = computed(() => createRingPaths({
  data: props.data,
  baseInnerRadius: scaledBaseInnerRadius.value,
  ringGap: scaledRingGap.value,
  strokeWidth: scaledStrokeWidth.value,
  startAngle: props.startAngle,
  endAngle: props.endAngle,
}))

const context: BklitRingContext = {
  data: props.data,
  hoveredIndex,
  baseInnerRadius: scaledBaseInnerRadius.value,
  ringGap: scaledRingGap.value,
  strokeWidth: scaledStrokeWidth.value,
  startAngle: props.startAngle,
  endAngle: props.endAngle,
  enterStaggerScale: props.enterStaggerScale,
  setHoveredIndex: (index) => {
    if (hoverClearTimer) {
      clearTimeout(hoverClearTimer)
      hoverClearTimer = undefined
    }
    hoveredIndex.value = index
  },
  clearHoveredIndex: () => {
    if (hoverClearTimer) {
      clearTimeout(hoverClearTimer)
    }

    // Keep the active layer alive for the short gap while Motion moves the
    // ring or the pointer crosses from a ring to its matching legend row.
    hoverClearTimer = setTimeout(() => {
      hoveredIndex.value = null
      hoverClearTimer = undefined
    }, 70)
  },
  getRingColor: index => props.data[index]?.color ?? 'currentColor',
  getRingPath: (index, lineCap = 'round') => {
    if (lineCap === 'round') {
      return ringPaths.value[index] ?? { backgroundPath: '', progressPath: '' }
    }
    const item = props.data[index]
    return item ? createRingPaths({ data: [item], baseInnerRadius: scaledBaseInnerRadius.value + index * (scaledStrokeWidth.value + scaledRingGap.value), ringGap: scaledRingGap.value, strokeWidth: scaledStrokeWidth.value, startAngle: props.startAngle, endAngle: props.endAngle, lineCap })[0] ?? { backgroundPath: '', progressPath: '' } : { backgroundPath: '', progressPath: '' }
  },
  getProgressPath: (index, progress, lineCap = 'round') => {
    const item = props.data[index]
    return item ? createProgressPath({ item, index, progress, baseInnerRadius: scaledBaseInnerRadius.value, ringGap: scaledRingGap.value, strokeWidth: scaledStrokeWidth.value, startAngle: props.startAngle, endAngle: props.endAngle, lineCap }) : ''
  },
}

provide(bklitRingContextKey, context)
</script>

<template>
  <div class="flex shrink-0 flex-col max-w-full aspect-auto items-center justify-center relative sm:flex-row sm:aspect-square" :style="{ width: `${props.size}px` }">
    <svg class="h-auto w-full aspect-square overflow-visible" :viewBox="`0 0 ${props.size} ${props.size}`" role="img" aria-label="Code quality profile">
      <g :transform="`translate(${props.size / 2} ${props.size / 2})`">
        <slot />
      </g>
    </svg>
    <div
      class="flex pointer-events-none items-center left-1/2 top-1/2 justify-center absolute -translate-x-1/2 -translate-y-1/2"
      :style="{ width: `${Math.max(scaledBaseInnerRadius * 2 - 16, 0)}px`, height: `${Math.max(scaledBaseInnerRadius * 2 - 16, 0)}px` }"
    >
      <slot name="center" />
    </div>
    <slot name="legend" />
  </div>
</template>
