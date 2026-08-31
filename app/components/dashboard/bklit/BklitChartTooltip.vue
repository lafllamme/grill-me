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
    <svg v-if="props.showDots" class="h-full w-full pointer-events-none inset-0 absolute overflow-visible" viewBox="0 0 640 320" aria-hidden="true">
      <BklitTooltipDot v-for="key in seriesKeys" :key="key" :data-key="key" :color="context.seriesColors[key]" />
    </svg>
    <div ref="tooltipRef" class="pointer-events-none absolute z-50" :style="tooltipStyle">
      <div class="text-on-background rounded-none bg-chart-tooltip min-w-[140px] shadow-lg overflow-hidden backdrop-blur-md" :style="panelStyle">
        <div class="px-3 py-2.5">
          <p class="text-xs font-medium mb-2">
            {{ context.data[context.hoveredIndex.value]?.[context.xDataKey] }}
          </p>
          <div class="flex flex-col gap-1.5">
            <div v-for="key in seriesKeys" :key="key" class="text-sm flex gap-4 items-center justify-between">
              <span class="text-on-surface-variant/70 flex gap-2 min-w-0 items-center">
                <span class="rounded-full shrink-0 h-2.5 w-2.5" :style="{ backgroundColor: context.seriesColors[key] ?? 'var(--color-surface-variant)' }" />
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
                <strong :key="Number(context.data[context.hoveredIndex.value]?.[key] ?? 0)" class="text-on-background font-medium shrink-0 tabular-nums">{{ Number(context.data[context.hoveredIndex.value]?.[key] ?? 0).toLocaleString() }}</strong>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>
