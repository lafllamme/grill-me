<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { bklitBarContextKey } from './bar-context'
import BklitTooltipDot from './BklitTooltipDot.vue'
import BklitTooltipIndicator from './BklitTooltipIndicator.vue'
import { useBklitSpring } from './use-bklit-spring'

const props = withDefaults(defineProps<{
  showCrosshair?: boolean
  showDots?: boolean
}>(), { showCrosshair: true, showDots: true })

const context = inject(bklitBarContextKey)
if (!context) {
  throw new Error('BklitChartTooltip must be rendered inside BklitBarChart')
}

const seriesKeys = computed(() => Object.keys(context.data[0] ?? {}).filter(key => key !== context.xDataKey && typeof context.data[0]?.[key] === 'number'))
const tooltipRef = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const containerHeight = ref(0)
const tooltipWidth = ref(180)
const tooltipHeight = ref(80)
const targetX = computed(() => context.animatedTooltipX.value / context.chartWidth * containerWidth.value)
const targetY = computed(() => context.plotTop / context.chartHeight * containerHeight.value)
const isFlipped = computed(() => targetX.value + tooltipWidth.value + 16 > containerWidth.value)
const targetLeft = computed(() => isFlipped.value ? targetX.value - 16 - tooltipWidth.value : targetX.value + 16)
const targetTop = computed(() => Math.max(16, Math.min(targetY.value - tooltipHeight.value / 2, containerHeight.value - tooltipHeight.value - 16)))
const tooltipX = useBklitSpring(targetLeft, { stiffness: 100, damping: 20 })
const tooltipY = useBklitSpring(targetTop, { stiffness: 100, damping: 20 })
const entranceScaleTarget = ref(0.85)
const entranceOpacityTarget = ref(0)
const entranceXTarget = ref(isFlipped.value ? 20 : -20)
const entranceScale = useBklitSpring(entranceScaleTarget, { stiffness: 300, damping: 25 }, 0.85)
const entranceOpacity = useBklitSpring(entranceOpacityTarget, { stiffness: 300, damping: 25 })
const entranceX = useBklitSpring(entranceXTarget, { stiffness: 300, damping: 25 }, entranceXTarget.value)
const tooltipStyle = computed(() => ({
  left: `${tooltipX.value}px`,
  top: `${tooltipY.value}px`,
  opacity: entranceOpacity.value,
}))
const panelStyle = computed(() => ({
  transform: `translateX(${entranceX.value}px) scale(${entranceScale.value})`,
  transformOrigin: isFlipped.value ? 'right top' : 'left top',
}))

function measureTooltip() {
  const tooltip = tooltipRef.value
  const container = tooltip?.parentElement
  if (!tooltip || !container) {
    return
  }
  const containerBounds = container.getBoundingClientRect()
  containerWidth.value = containerBounds.width
  containerHeight.value = containerBounds.height
  tooltipWidth.value = tooltip.offsetWidth || tooltipWidth.value
  tooltipHeight.value = tooltip.offsetHeight || tooltipHeight.value
}

onMounted(() => {
  nextTick(measureTooltip)
  nextTick(() => {
    entranceScaleTarget.value = 1
    entranceOpacityTarget.value = 1
    entranceXTarget.value = 0
  })
})

watch(() => context.hoveredIndex.value, () => {
  nextTick(measureTooltip)
})

onBeforeUnmount(() => {
  tooltipRef.value = null
})
</script>

<template>
  <template v-if="context.hoveredIndex.value !== null && context.status.value === 'ready'">
    <BklitTooltipIndicator v-if="props.showCrosshair" />
    <svg v-if="props.showDots" class="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 640 320" aria-hidden="true">
      <BklitTooltipDot v-for="key in seriesKeys" :key="key" :data-key="key" :color="context.seriesColors[key]" />
    </svg>
    <div ref="tooltipRef" class="pointer-events-none absolute z-50" :style="tooltipStyle">
      <div class="min-w-[140px] overflow-hidden rounded-none bg-chart-tooltip text-on-background shadow-lg backdrop-blur-md" :style="panelStyle">
        <div class="px-3 py-2.5">
          <p class="mb-2 text-xs font-medium">{{ context.data[context.hoveredIndex.value]?.[context.xDataKey] }}</p>
          <div class="flex flex-col gap-1.5">
            <div v-for="key in seriesKeys" :key="key" class="flex items-center justify-between gap-4 text-sm">
              <span class="flex min-w-0 items-center gap-2 text-on-surface-variant/70">
                <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: context.seriesColors[key] ?? 'var(--color-surface-variant)' }" />
                <span>{{ key }}</span>
              </span>
              <Transition
                :key="`${key}-${context.hoveredIndex.value}`"
                mode="out-in"
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="translate-y-2 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="translate-y-0 opacity-100"
                leave-to-class="-translate-y-2 opacity-0"
              >
                <strong class="shrink-0 tabular-nums text-on-background font-medium" :key="Number(context.data[context.hoveredIndex.value]?.[key] ?? 0)">{{ Number(context.data[context.hoveredIndex.value]?.[key] ?? 0).toLocaleString() }}</strong>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>
