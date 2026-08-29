<script setup lang="ts">
import type { SunburstArc } from './sunburst'
import { computed } from 'vue'
import { createSunburstPath } from './sunburst'
import { useBklitEnter } from './use-bklit-enter'

const props = defineProps<{
  arc: SunburstArc
  color: string
  delay: number
  hoverGrow: number
  radius: number
  reducedMotion: boolean
  replayKey: string
}>()
const emit = defineEmits<{ select: [] }>()
const progress = useBklitEnter(!props.reducedMotion, props.delay, `${props.replayKey}-${props.arc.id}`, { type: 'tween', durationSeconds: 0.62 })
const path = computed(() => createSunburstPath(props.arc, props.radius, props.reducedMotion ? 1 : progress.value, props.hoverGrow))
</script>

<template>
  <path
    :d="path"
    :fill="props.color"
    fill-opacity="0.9"
    stroke="var(--color-chart-track)"
    stroke-width="1"
    stroke-linejoin="round"
    tabindex="0"
    :aria-label="`${props.arc.name}, ${props.arc.value} changes`"
    role="button"
    @click="emit('select')"
    @keydown.enter="emit('select')"
    @keydown.space.prevent="emit('select')"
  />
</template>
