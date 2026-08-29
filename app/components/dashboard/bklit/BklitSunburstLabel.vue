<script setup lang="ts">
import type { SunburstArc, SunburstGeometry } from './sunburst'
import { animate, motionValue } from 'motion-v'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  arc: SunburstArc
  geometry: SunburstGeometry
  hoverGrow: number
  hoverOffset: number
  reducedMotion: boolean
}>()

const hoverProgressMotion = motionValue(props.reducedMotion ? 1 : 0)
const hoverProgress = ref(hoverProgressMotion.get())
let stopHoverAnimation: (() => void) | undefined

function animateHover() {
  stopHoverAnimation?.()
  if (props.reducedMotion) {
    hoverProgressMotion.set(1)
    return
  }
  const target = props.hoverGrow || props.hoverOffset ? 1 : 0
  const controls = animate(hoverProgressMotion, target, { type: 'tween', duration: 0.42, ease: [0.22, 1, 0.36, 1] })
  stopHoverAnimation = () => controls.stop()
}

onMounted(() => {
  const unsubscribe = hoverProgressMotion.on('change', (value) => {
    hoverProgress.value = value
  })
  animateHover()
  onBeforeUnmount(unsubscribe)
})
watch(() => [props.hoverGrow, props.hoverOffset, props.reducedMotion], animateHover)
onBeforeUnmount(() => stopHoverAnimation?.())

const angle = computed(() => (props.arc.startAngle + props.arc.endAngle) / 2)
const labelRadius = computed(() =>
  (props.geometry.innerRadius + props.geometry.outerRadius) / 2
  + props.hoverOffset * hoverProgress.value
  + (props.hoverGrow * hoverProgress.value) / 2,
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
    {{ props.arc.name }}
  </text>
</template>
