<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  tone?: 'neutral' | 'raised' | 'signal'
}>(), {
  label: 'Loading',
  tone: 'neutral',
})
</script>

<template>
  <div
    class="animate-pulse"
    :class="tone === 'raised' ? 'bg-surface-container-highest' : tone === 'signal' ? 'bg-primary' : 'bg-on-surface/20'"
    role="status"
    :aria-label="label"
  />
</template>
