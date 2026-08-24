<script setup lang="ts">
import type { PatternPresetId } from './pattern-preset'
import { computed, inject, useId } from 'vue'
import { bklitBarContextKey } from './bar-context'
import { computeSquareColumn } from './bar-squares-layout'

const props = withDefaults(defineProps<{
  dataKey: string
  fill?: string
  stroke?: string
  squareGap?: number
  fit?: boolean
  patternPreset?: PatternPresetId
  animate?: boolean
  fadedOpacity?: number
}>(), {
  fill: 'var(--color-chart-line-primary)',
  stroke: undefined,
  squareGap: 3,
  fit: false,
  patternPreset: 'none',
  animate: true,
  fadedOpacity: 0.3,
})

const injectedContext = inject(bklitBarContextKey)
if (!injectedContext)
  throw new Error('BklitBarSquares must be rendered inside BklitBarChart')
const context = injectedContext
const patternId = `bklit-square-pattern-${useId()}`
const baseline = context.chartHeight - context.plotBottom
const plotHeight = baseline - context.plotTop
const bandWidth = computed(() => ((context.chartWidth - context.plotLeft - context.plotRight) / Math.max(context.data.length, 1)) * (1 - context.barGap))
const squareSize = computed(() => context.barWidth ?? Math.max(8, bandWidth.value / Math.max(context.seriesCount, 1) - 2))

function getColumn(index: number) {
  const value = context.valueAt(props.dataKey, index)
  return computeSquareColumn({ barLengthPx: value / context.maxValue(props.dataKey) * plotHeight, squareSize: squareSize.value, gap: props.squareGap, fit: props.fit })
}

function getX(index: number) {
  const groupGap = context.seriesCount > 1 ? 4 : 0
  const groupWidth = squareSize.value * context.seriesCount + groupGap * (context.seriesCount - 1)
  const seriesIndex = Math.max(0, context.seriesOrder.indexOf(props.dataKey))
  return context.xAt(index) - groupWidth / 2 + seriesIndex * (squareSize.value + groupGap)
}

function getOpacity(index: number) {
  return context.hoveredIndex.value !== null && context.hoveredIndex.value !== index ? props.fadedOpacity : 1
}
</script>

<template>
  <g :style="{ color: props.fill }">
    <defs>
      <pattern :id="patternId" width="8" height="8" patternUnits="userSpaceOnUse">
        <path v-if="props.patternPreset === 'diagonal' || props.patternPreset === 'crosshatch'" d="M-2 2L2-2M0 8L8 0M6 10L10 6" stroke="currentColor" stroke-width="1" opacity="0.6" />
        <path v-if="props.patternPreset === 'crosshatch'" d="M-2 6L2 10M0 0L8 8M6-2L10 2" stroke="currentColor" stroke-width="1" opacity="0.45" />
        <circle v-if="props.patternPreset === 'dots'" cx="2" cy="2" r="1" fill="currentColor" />
      </pattern>
    </defs>
    <template v-for="(_, index) in context.data" :key="index">
      <rect
        v-for="(offset, squareIndex) in getColumn(index).positions"
        :key="`${index}-${squareIndex}`"
        :x="getX(index)"
        :y="baseline - getColumn(index).columnHeight + offset"
        :width="squareSize"
        :height="squareSize"
        :fill="props.patternPreset === 'none' ? props.fill : `url(#${patternId})`"
        :opacity="getOpacity(index)"
        :class="props.animate ? 'animate-bklit-bar-reveal' : ''"
        :style="{ animationDelay: `${squareIndex * 0.025}s` }"
      />
    </template>
  </g>
</template>
