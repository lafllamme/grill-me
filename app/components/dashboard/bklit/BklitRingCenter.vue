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
  <div class="text-center flex flex-col h-full items-center justify-center transition-[opacity,transform] duration-500 ease-out" :style="{ opacity: context.isEntered.value ? 1 : 0, transform: context.isEntered.value ? 'translateY(0)' : 'translateY(8px)' }">
    <NumberFlow :value="centerValue" class="text-2xl text-on-background tracking-[-0.06em] leading-none font-display" :will-change="true" :isolate="true" />
    <span class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta mt-1 uppercase">{{ centerLabel }}</span>
  </div>
</template>
