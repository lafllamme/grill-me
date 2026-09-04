<script setup lang="ts">
import type { SunburstArc, SunburstGeometry } from './sunburst'
import { computed } from 'vue'

const props = defineProps<{
  arc: SunburstArc
  geometry: SunburstGeometry
  label: string
  hoverGrow: number
  hoverOffset: number
  reducedMotion: boolean
}>()

const angle = computed(() => (props.geometry.startAngle + props.geometry.endAngle) / 2)
const labelRadius = computed(() =>
  (props.geometry.innerRadius + props.geometry.outerRadius) / 2
  + props.hoverOffset
  + props.hoverGrow / 2,
)
const position = computed(() => ({
  x: Number((Math.sin(angle.value) * labelRadius.value).toFixed(3)),
  y: Number((-Math.cos(angle.value) * labelRadius.value).toFixed(3)),
}))
const rotation = computed(() => {
  let degrees = angle.value * 180 / Math.PI - 90
  if (degrees > 90) {
    degrees -= 180
  }
  if (degrees < -90) {
    degrees += 180
  }
  return degrees
})
</script>

<template>
  <text
    :x="position.x"
    :y="position.y"
    dominant-baseline="middle"
    fill="var(--chart-label)"
    font-size="11"
    font-weight="600"
    text-anchor="middle"
    paint-order="stroke"
    pointer-events="none"
    stroke="var(--chart-background)"
    stroke-linejoin="round"
    stroke-width="2.5"
    :transform="`rotate(${rotation} ${position.x} ${position.y})`"
  >
    <title>{{ props.arc.name }}</title>
    {{ props.label }}
  </text>
</template>
