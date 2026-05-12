<script setup lang="ts">
import { ROAST_INTENSITY_LEVELS } from '~/constants/roastIntensity'

const props = withDefaults(defineProps<{
  modelValue: number
  disabled?: boolean
}>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const currentValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    const normalized = Math.min(4, Math.max(1, Math.round(Number(value))))
    emit('update:modelValue', normalized)
  },
})

const trackPercent = computed(() => ((currentValue.value - 1) / 3) * 100)
</script>

<template>
  <div class="px-1 pt-5 space-y-5">
    <div class="flex items-center justify-between">
      <span class="text-[10px] text-on-surface-variant tracking-[0.2em] font-body font-bold uppercase">
        Roast Level
      </span>
      <span class="text-[10px] text-primary tracking-[0.2em] font-body font-bold uppercase">
        Critical Temperature
      </span>
    </div>

    <div class="space-y-4">
      <div class="h-5 relative">
        <div class="rounded-full bg-surface-container-high h-1 inset-x-0 top-1/2 absolute -translate-y-1/2" />
        <div
          class="rounded-full bg-primary h-1 transition-[width] duration-200 ease-out left-0 top-1/2 absolute -translate-y-1/2"
          :style="{ width: `${trackPercent}%` }"
        />
        <div
          class="rounded-full bg-primary h-4 w-4 shadow-[0_0_16px_rgba(255,86,51,0.55)] transition-[left] duration-200 ease-out top-1/2 absolute -translate-1/2"
          :style="{ left: `${trackPercent}%` }"
        />
        <input
          v-model.number="currentValue"
          class="opacity-0 h-full w-full cursor-pointer inset-0 absolute disabled:cursor-not-allowed"
          data-testid="roast-intensity-slider"
          :disabled="disabled"
          max="4"
          min="1"
          step="1"
          type="range"
        >
      </div>

      <div class="flex justify-between">
        <span
          v-for="level in ROAST_INTENSITY_LEVELS"
          :key="level.value"
          :class="level.value === currentValue ? 'text-primary' : 'text-on-surface-variant/70'"
          :data-testid="`roast-level-${level.key}`"
          class="text-[10px] tracking-[0.18em] font-body font-bold uppercase transition-colors"
        >
          {{ level.label }}
        </span>
      </div>
    </div>
  </div>
</template>
