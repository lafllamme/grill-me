<script setup lang="ts">
import { computed } from 'vue'

import { GRILLME_MARK_SHAPES } from './grillme-mark-shapes'
import { WORDMARK_FONTS } from './grillme-wordmark-fonts'

const SHAPE_IDS = Object.keys(GRILLME_MARK_SHAPES).sort()
const FONT_IDS = Object.keys(WORDMARK_FONTS)

const route = useRoute()
const router = useRouter()

const activeShape = computed(() => {
  const raw = route.query.logo
  return typeof raw === 'string' ? raw : '85'
})

const activeFont = computed(() => {
  const raw = route.query.font
  return typeof raw === 'string' ? raw : 'bricolage'
})

function selectShape(id = '85') {
  const query = { ...route.query }
  if (id && id !== '85') {
    query.logo = id
  }
  else {
    delete query.logo
  }
  void router.replace({ query })
}

function selectFont(id: string) {
  const query = { ...route.query }
  if (id === 'azeret') {
    delete query.font
  }
  else {
    query.font = id
  }
  void router.replace({ query })
}

function stepShape(direction: 1 | -1) {
  const currentIndex = SHAPE_IDS.indexOf(activeShape.value)
  const nextIndex = (currentIndex + direction + SHAPE_IDS.length) % SHAPE_IDS.length
  selectShape(SHAPE_IDS[nextIndex])
}
</script>

<template>
  <div
    class="text-explore-copy p-3 border border-white/10 rounded-xl bg-black/70 max-w-[560px] right-6 bottom-28 fixed z-50 backdrop-blur-md"
  >
    <div class="mb-3 flex items-center justify-between">
      <div class="gap-2 flex items-center">
        <span class="text-[10px] tracking-[0.14em] font-meta uppercase opacity-60">Logo mark</span>
        <span class="text-[11px] font-meta px-2 py-0.5 rounded-md bg-white/20">#{{ activeShape }} · Stripe flame</span>
      </div>
      <div class="gap-1 flex items-center">
        <button
          type="button"
          class="text-xs px-2 py-0.5 rounded-md transition-colors hover:bg-white/15"
          aria-label="Previous logo shape"
          @click="stepShape(-1)"
        >
          ←
        </button>
        <button
          type="button"
          class="text-xs px-2 py-0.5 rounded-md transition-colors hover:bg-white/15"
          aria-label="Next logo shape"
          @click="stepShape(1)"
        >
          →
        </button>
        <button
          type="button"
          class="text-[11px] font-meta px-2 py-0.5 rounded-md opacity-60 transition-colors hover:bg-white/15 hover:opacity-100"
          @click="selectShape()"
        >
          Reset
        </button>
      </div>
    </div>
    <div class="grid grid-cols-12 gap-1">
      <button
        v-for="id in SHAPE_IDS"
        :key="id"
        type="button"
        class="text-[10px] font-meta px-1 py-0.5 rounded transition-colors"
        :aria-label="`Select logo shape ${id}`"
        :aria-pressed="activeShape === id"
        :class="activeShape === id ? 'bg-white/25' : 'opacity-55 hover:bg-white/15 hover:opacity-100'"
        @click="selectShape(id)"
      >
        {{ id }}
      </button>
    </div>
    <div class="mt-2 pt-2 border-t border-white/10 flex gap-1 items-center flex-wrap">
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
