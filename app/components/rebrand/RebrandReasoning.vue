<script setup lang="ts">
import { useTimeoutFn } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { Icon } from '#components'
import RebrandTextShimmer from '~/components/rebrand/RebrandTextShimmer.vue'

const props = defineProps<{
  username: string
  isActive: boolean
  hasResult: boolean
}>()

const isOpen = ref(true)
const startedAt = ref<number | null>(null)
const durationSeconds = ref<number | null>(null)

const { start: scheduleClose, stop: cancelClose } = useTimeoutFn(() => {
  isOpen.value = false
}, 900, { immediate: false })

const completedLabel = computed(() => {
  const seconds = durationSeconds.value ?? 1
  return `Thought for ${seconds} ${seconds === 1 ? 'second' : 'seconds'}`
})

function finishTiming() {
  if (startedAt.value === null)
    return

  durationSeconds.value = Math.max(1, Math.round((Date.now() - startedAt.value) / 1000))
  startedAt.value = null
}

watch(() => props.isActive, (isActive, wasActive) => {
  if (isActive) {
    cancelClose()
    if (!wasActive) {
      startedAt.value = Date.now()
      durationSeconds.value = null
    }
    isOpen.value = true
    return
  }

  if (wasActive)
    finishTiming()
}, { immediate: true })

watch(() => props.hasResult, (hasResult, hadResult) => {
  if (!hasResult || hadResult)
    return

  finishTiming()
  scheduleClose()
})
</script>

<template>
  <section data-testid="test-2-reasoning">
    <button
      type="button"
      data-testid="test-2-reasoning-trigger"
      class="group text-left flex gap-3 max-w-full items-center"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span class="border-[1px] border-signal-red-500/20 rounded-lg border-solid bg-signal-red-950/35 shrink-0 grid h-8 w-8 transition-colors place-items-center group-hover:border-signal-red-500/35">
        <Icon class="text-base text-signal-red-400" :class="isActive ? 'animate-pulse' : ''" name="ph:brain" />
      </span>
      <RebrandTextShimmer v-if="isActive" class="text-sm font-body truncate sm:text-base" :text="`Investigating @${username}`" />
      <span v-else class="text-sm text-explore-muted font-body truncate transition-colors sm:text-base group-hover:text-explore-copy">
        {{ completedLabel }}
      </span>
      <Icon class="text-sm text-explore-muted shrink-0 transition-transform duration-300" :class="isOpen ? 'rotate-180' : ''" name="ph:caret-down" />
    </button>

    <div class="grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" :class="isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
      <div class="overflow-hidden">
        <div class="pt-7 sm:pt-9">
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>
