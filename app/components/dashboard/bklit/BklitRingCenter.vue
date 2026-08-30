<script setup lang="ts">
import NumberFlow from '@number-flow/vue'
import { computed, inject } from 'vue'
import { bklitRingContextKey } from './ring-context'

const props = withDefaults(defineProps<{
  defaultLabel?: string
}>(), {
  defaultLabel: 'Total',
})

const context = inject(bklitRingContextKey)

if (!context) {
  throw new Error('BklitRingCenter must be rendered inside BklitRingChart')
}

const totalValue = computed(() => context.data.reduce((sum, item) => sum + item.value, 0))
const centerValue = computed(() => context.hoveredIndex.value === null
  ? totalValue.value
  : context.data[context.hoveredIndex.value]?.value ?? totalValue.value)
const centerLabel = computed(() => context.hoveredIndex.value === null
  ? props.defaultLabel
  : context.data[context.hoveredIndex.value]?.label ?? props.defaultLabel)
</script>

<template>
  <div class="@container/chart-center text-center flex flex-col size-full min-w-0 items-center justify-center">
    <NumberFlow :value="centerValue" class="text-[clamp(0.75rem,22cqw,1.875rem)] leading-none font-bold tabular-nums" :style="{ color: 'var(--chart-text)' }" :will-change="true" :isolate="true" />
    <span class="text-[clamp(0.625rem,9cqw,0.75rem)] leading-tight mt-0.5 max-w-full truncate" :style="{ color: 'var(--chart-label)' }">{{ centerLabel }}</span>
  </div>
</template>
