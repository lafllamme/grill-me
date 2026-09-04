<script setup lang="ts">
const props = defineProps<{
  fill: string
  label: string
  radius: number
}>()

const emit = defineEmits<{ activate: [] }>()
</script>

<template>
  <circle
    class="sunburst-center-hub cursor-pointer"
    :r="Math.max(props.radius - 2, 0)"
    :fill="props.fill"
    stroke="var(--color-chart-track)"
    stroke-linejoin="round"
    stroke-width="1.5"
    tabindex="0"
    role="button"
    :aria-label="props.label"
    @click="emit('activate')"
    @keydown.enter="emit('activate')"
    @keydown.space.prevent="emit('activate')"
  >
    <title>{{ props.label }}</title>
  </circle>
</template>

<style scoped>
.sunburst-center-hub:focus:not(:focus-visible) {
  outline: none;
}

.sunburst-center-hub:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}
</style>
