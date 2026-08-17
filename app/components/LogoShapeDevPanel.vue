<script setup lang="ts">
import { computed } from 'vue'

import { WORDMARK_FONTS } from './grillme-wordmark-fonts'

const FONT_IDS = Object.keys(WORDMARK_FONTS)

const route = useRoute()
const router = useRouter()

const activeFont = computed(() => {
  const raw = route.query.font
  return typeof raw === 'string' ? raw : 'general'
})

function selectFont(id: string) {
  const query = { ...route.query }
  query.font = id
  void router.replace({ query })
}
</script>

<template>
  <div
    class="text-explore-copy p-3 border border-white/10 rounded-xl bg-black/70 max-w-[560px] right-6 bottom-28 fixed z-50 backdrop-blur-md"
  >
    <div class="flex gap-1 items-center flex-wrap">
      <span class="text-[10px] tracking-[0.14em] font-meta uppercase mr-1 opacity-60">Font</span>
      <button
        v-for="id in FONT_IDS"
        :key="id"
        type="button"
        class="text-[11px] font-meta px-2 py-0.5 rounded-md transition-colors"
        :aria-pressed="activeFont === id"
        :class="activeFont === id ? 'bg-white/20' : 'opacity-60 hover:bg-white/15 hover:opacity-100'"
        @click="selectFont(id)"
      >
        {{ WORDMARK_FONTS[id]?.label }}
      </button>
    </div>
  </div>
</template>
