<script setup lang="ts">
import type { BklitRingContext, BklitRingData } from './ring-context'
import { computed, provide, ref } from 'vue'
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
    hoveredIndex.value = index
  },
  clearHoveredIndex: () => {
    hoveredIndex.value = null
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
  <div class="relative flex shrink-0 items-center justify-center" :style="{ width: `${props.size}px`, height: `${props.size}px` }">
    <svg class="h-full w-full overflow-visible" :viewBox="`0 0 ${props.size} ${props.size}`" role="img" aria-label="Code quality profile">
      <g :transform="`translate(${props.size / 2} ${props.size / 2})`">
        <slot />
      </g>
    </svg>
    <div
      class="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
      :style="{ width: `${Math.max(scaledBaseInnerRadius * 2 - 16, 0)}px`, height: `${Math.max(scaledBaseInnerRadius * 2 - 16, 0)}px` }"
    >
      <slot name="center" />
    </div>
    <slot name="legend" />
  </div>
</template>
