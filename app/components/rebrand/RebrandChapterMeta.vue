<script setup lang="ts">
defineProps<{
  index: string
  title: string
  copyright?: string
}>()
</script>

<template>
  <header class="py-5 border-t-[1px] border-basalt-950/18 border-solid gap-6 grid grid-cols-[1fr_auto] sm:grid-cols-3">
    <p class="text-[10px] text-basalt-700 tracking-[0.12em] font-meta uppercase">
      ◆ ({{ index }})
    </p>
    <p class="text-[10px] text-basalt-950 tracking-[-0.01em] font-body sm:text-center">
      ({{ title }})
    </p>
    <p class="text-[10px] text-basalt-700 tracking-[0.08em] font-meta text-right hidden uppercase sm:block">
      {{ copyright ?? '© Grillme' }}
    </p>
  </header>
</template>
