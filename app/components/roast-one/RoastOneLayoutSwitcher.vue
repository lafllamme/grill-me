<script setup lang="ts">
import type { RoastOneLayout } from '~/data/roast-one-lab'
import { roastOneLabLayouts } from '~/data/roast-one-lab'

defineProps<{ activeLayout: RoastOneLayout }>()
const emit = defineEmits<{ select: [layout: RoastOneLayout] }>()
</script>

<template>
  <nav class="pb-1 flex gap-2 overflow-x-auto lg:flex-wrap lg:justify-end lg:overflow-visible" aria-label="Roast-1 layout variants">
    <button v-for="layout in roastOneLabLayouts" :key="layout.id" type="button" class="text-[10px] tracking-[0.12em] font-meta px-3 py-2 border rounded-full shrink-0 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-3" :class="activeLayout === layout.id ? 'text-primary border-primary bg-primary/8' : 'text-on-surface-variant border-outline hover:text-on-background hover:border-on-surface-variant'" :aria-pressed="activeLayout === layout.id" @click="emit('select', layout.id)">
      {{ layout.id }} · {{ layout.label }}
    </button>
  </nav>
</template>
