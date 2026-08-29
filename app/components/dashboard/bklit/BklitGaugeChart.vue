<script setup lang="ts">
import NumberFlow from '@number-flow/vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BklitGaugeNotch from './BklitGaugeNotch.vue'

const props = withDefaults(defineProps<{
  value: number
  centerValue?: number
  defaultLabel?: string
  totalNotches?: number
  spacing?: number
  notchCornerRadius?: number
  startAngle?: number
  endAngle?: number
  width?: number
  height?: number
  activeFill?: string
  inactiveFill?: string
  activeFillOpacity?: number
  inactiveFillOpacity?: number
  replayKey?: string
}>(), {
  defaultLabel: 'Total',
  totalNotches: 40,
  spacing: 25,
  notchCornerRadius: 0,
  startAngle: 135,
  endAngle: 405,
  width: 320,
  height: 244,
  activeFill: 'var(--color-primary)',
  inactiveFill: 'var(--color-chart-track)',
  activeFillOpacity: 1,
  inactiveFillOpacity: 0.8,
})

const displayedCenterValue = ref(0)
let isMounted = false
let hasScheduledCenterEntrance = false
let hasStartedCenterEntrance = false
let outerFrame = 0
let innerFrame = 0

function scheduleCenterEntrance() {
  if (!isMounted || hasScheduledCenterEntrance || props.centerValue === undefined) {
    return
  }

  hasScheduledCenterEntrance = true
  displayedCenterValue.value = 0
  outerFrame = requestAnimationFrame(() => {
    innerFrame = requestAnimationFrame(() => {
      if (props.centerValue === undefined) {
        return
      }

      displayedCenterValue.value = props.centerValue
      hasStartedCenterEntrance = true
    })
  })
}

onMounted(() => {
  isMounted = true
  scheduleCenterEntrance()
})

watch(() => props.centerValue, (value) => {
  if (value !== undefined && !hasScheduledCenterEntrance) {
    scheduleCenterEntrance()
  }
  else if (value !== undefined && hasStartedCenterEntrance) {
    displayedCenterValue.value = value
  }
})

onBeforeUnmount(() => {
  isMounted = false
  cancelAnimationFrame(outerFrame)
  cancelAnimationFrame(innerFrame)
})

const clampedValue = computed(() => Math.min(100, Math.max(0, props.value)))
const activeNotches = computed(() => Math.round((clampedValue.value / 100) * props.totalNotches))
const centerX = computed(() => props.width / 2)
const centerY = computed(() => props.height / 2)
const size = computed(() => Math.min(props.width, props.height))
const outerRadius = computed(() => size.value * 0.42)
const innerRadius = computed(() => size.value * 0.28)
const centerSize = computed(() => innerRadius.value * 2 - 16)
const notchDepth = computed(() => outerRadius.value - innerRadius.value)
const totalAngle = computed(() => props.endAngle - props.startAngle)
const availableAngle = computed(() => totalAngle.value * (1 - props.spacing / 100))
const notchAngle = computed(() => props.totalNotches > 0 ? availableAngle.value / props.totalNotches : 0)
const gapAngle = computed(() => totalAngle.value * (props.spacing / 100) / Math.max(props.totalNotches - 1, 1))

function polarPoint(angle: number, radius: number) {
  const radians = angle * Math.PI / 180
  return { x: centerX.value + Math.cos(radians) * radius, y: centerY.value + Math.sin(radians) * radius }
}

function formatCoordinate(value: number) {
  return value.toFixed(3)
}

function createNotchPath(index: number) {
  const angle = props.startAngle + index * (notchAngle.value + gapAngle.value) + notchAngle.value / 2
  const halfAngle = notchAngle.value * 0.8 / 2
  const outerStart = polarPoint(angle - halfAngle, outerRadius.value)
  const outerEnd = polarPoint(angle + halfAngle, outerRadius.value)
  const innerEnd = polarPoint(angle + halfAngle, innerRadius.value)
  const innerStart = polarPoint(angle - halfAngle, innerRadius.value)
  const corner = Math.min(props.notchCornerRadius, notchDepth.value / 2)

  if (corner === 0) {
    return `M ${formatCoordinate(outerStart.x)} ${formatCoordinate(outerStart.y)} L ${formatCoordinate(outerEnd.x)} ${formatCoordinate(outerEnd.y)} L ${formatCoordinate(innerEnd.x)} ${formatCoordinate(innerEnd.y)} L ${formatCoordinate(innerStart.x)} ${formatCoordinate(innerStart.y)} Z`
  }

  return `M ${formatCoordinate(outerStart.x)} ${formatCoordinate(outerStart.y)} L ${formatCoordinate(outerEnd.x)} ${formatCoordinate(outerEnd.y)} Q ${formatCoordinate(outerEnd.x)} ${formatCoordinate(outerEnd.y)} ${formatCoordinate(innerEnd.x)} ${formatCoordinate(innerEnd.y)} L ${formatCoordinate(innerStart.x)} ${formatCoordinate(innerStart.y)} Q ${formatCoordinate(innerStart.x)} ${formatCoordinate(innerStart.y)} ${formatCoordinate(outerStart.x)} ${formatCoordinate(outerStart.y)} Z`
}

const notches = computed(() => Array.from({ length: props.totalNotches }, (_, index) => ({
  index,
  path: createNotchPath(index),
  isActive: index < activeNotches.value,
})))
</script>

<template>
  <div class="relative mx-auto w-full max-w-[560px]" :style="{ aspectRatio: `${width} / ${height}` }">
    <svg class="block h-full w-full overflow-visible" :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="`${defaultLabel}: ${centerValue ?? value}`">
      <g>
        <BklitGaugeNotch
          v-for="notch in notches"
          :key="`inactive-${notch.index}`"
          :path="notch.path"
          :fill="inactiveFill"
          :opacity="inactiveFillOpacity"
          :delay="notch.index * 0.015"
          :replay-key="replayKey"
        />
      </g>
      <g>
        <BklitGaugeNotch
          v-for="notch in notches.filter(item => item.isActive)"
          :key="`active-${notch.index}`"
          :path="notch.path"
          :fill="activeFill"
          :opacity="activeFillOpacity"
          :delay="0.3 + notch.index * 0.02"
          :replay-key="replayKey"
        />
      </g>
    </svg>
    <div v-if="centerValue !== undefined" class="pointer-events-none absolute inset-0 flex items-center justify-center pt-[8%]">
      <div class="@container/chart-center size-full min-w-0 text-center flex flex-col items-center justify-center" :style="{ width: `${centerSize}px`, height: `${centerSize}px` }">
        <span class="font-bold tabular-nums leading-none text-[clamp(0.75rem,22cqw,1.875rem)]" :style="{ color: 'var(--chart-text)' }">
          <NumberFlow :value="displayedCenterValue" :format="{ notation: 'standard', maximumFractionDigits: 0 }" :will-change="true" :isolate="true" />
        </span>
        <span class="max-w-full truncate leading-tight text-[clamp(0.625rem,9cqw,0.75rem)]" :style="{ color: 'var(--chart-label)' }">{{ defaultLabel }}</span>
      </div>
    </div>
  </div>
</template>
