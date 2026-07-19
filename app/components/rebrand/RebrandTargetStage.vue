<script setup lang="ts">
import type { RoastIntensityValue } from '~/constants/roastIntensity'
import { onClickOutside } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { Icon } from '#components'
import { ROAST_INTENSITY_LEVELS } from '~/constants/roastIntensity'
import { useRoastStore } from '~/stores/roastStore'

const props = withDefaults(defineProps<{
  isPending?: boolean
}>(), {
  isPending: false,
})

const emit = defineEmits<{
  submit: []
}>()

const intensityDescriptions: Record<RoastIntensityValue, string> = {
  1: 'Useful feedback with the safety on.',
  2: 'Sharp, specific, and still employable.',
  3: 'Technical honesty without anesthesia.',
  4: 'Maximum heat. No emotional warranty.',
}

const roastStore = useRoastStore()
const selectorRef = ref<HTMLElement | null>(null)
const isSelectorOpen = ref(false)

const githubUsername = computed({
  get: () => roastStore.githubUsername,
  set: value => roastStore.setUsername(value),
})

const selectedIntensity = computed(() =>
  ROAST_INTENSITY_LEVELS.find(level => level.value === roastStore.roastIntensity) ?? ROAST_INTENSITY_LEVELS[1]!,
)

function selectIntensity(value: RoastIntensityValue) {
  roastStore.setRoastIntensity(value)
  isSelectorOpen.value = false
}

function submitTarget() {
  if (!roastStore.canSubmit || props.isPending)
    return

  emit('submit')
}

onClickOutside(selectorRef, () => {
  isSelectorOpen.value = false
})

onMounted(() => {
  if (!roastStore.githubUsername)
    roastStore.setUsername('lafllamme')
})
</script>

<template>
  <section id="target" class="mx-auto px-4 max-w-[88rem] scroll-mt-28 lg:px-10 sm:px-6">
    <div class="mx-auto max-w-[70rem]">
      <div class="mb-10 text-center sm:mb-14">
        <p class="text-[10px] text-signal-red-400 tracking-[0.2em] font-meta uppercase sm:text-xs">
          Source target
        </p>
        <h2 class="text-[clamp(2.8rem,6vw,6.5rem)] text-explore-copy leading-[0.88] tracking-[-0.06em] font-display mt-5">
          Who are we grilling ?
        </h2>
      </div>

      <form class="border-[1px] border-explore-border rounded-[2rem] border-solid bg-black/58 shadow-[inset_0_1px_10px_rgba(255,255,255,0.055),0_36px_140px_rgba(37,0,6,0.48)] transition-colors backdrop-blur-2xl focus-within:border-explore-border-high sm:rounded-[2.5rem]" @submit.prevent="submitTarget">
        <div class="px-6 pb-10 pt-8 min-h-[13rem] sm:px-10 sm:pb-12 sm:pt-10">
          <label for="test-2-username" class="text-[10px] text-explore-muted tracking-[0.16em] font-meta uppercase">
            Public GitHub username
          </label>
          <div class="mt-5 flex gap-2 items-center sm:gap-3">
            <span class="text-2xl text-signal-red-400 font-mono sm:text-4xl">@</span>
            <input
              id="test-2-username"
              v-model="githubUsername"
              data-testid="test-2-username-input"
              class="text-2xl text-explore-copy leading-none tracking-[-0.035em] font-display outline-none bg-transparent flex-1 min-w-0 sm:text-4xl placeholder:text-explore-muted/55"
              type="text"
              placeholder="What's your GitHub name?"
              autocomplete="off"
              autocapitalize="none"
              spellcheck="false"
            >
          </div>
        </div>

        <footer class="px-4 pb-4 flex gap-2 items-center justify-between sm:px-6 sm:pb-6">
          <div class="flex gap-1.5 min-w-0 items-center sm:gap-2">
            <button type="button" class="text-xs text-explore-muted font-body px-3 py-2.5 rounded-xl gap-2 hidden transition-colors items-center hover:text-explore-copy hover:bg-white/[0.055] sm:flex">
              <Icon class="text-base" name="ph:github-logo" />
              <span>Public profile</span>
            </button>

            <div ref="selectorRef" class="relative">
              <button
                type="button"
                data-testid="test-2-intensity-trigger"
                class="text-xs text-explore-copy font-body px-3 py-2.5 rounded-xl flex gap-2 max-w-[12rem] transition-colors items-center sm:px-4 hover:bg-white/[0.055]"
                :aria-expanded="isSelectorOpen"
                aria-haspopup="listbox"
                @click="isSelectorOpen = !isSelectorOpen"
              >
                <Icon class="text-base text-signal-red-400 shrink-0" name="ph:fire" />
                <span class="truncate">{{ selectedIntensity.label }}</span>
                <Icon class="text-sm text-explore-muted shrink-0 transition-transform" :class="isSelectorOpen ? 'rotate-180' : ''" name="ph:caret-down" />
              </button>

              <Transition
                enter-active-class="transition duration-180 ease-out"
                enter-from-class="opacity-0 translate-y-2 scale-[0.98]"
                enter-to-class="opacity-100 translate-y-0 scale-100"
                leave-active-class="transition duration-120 ease-in"
                leave-from-class="opacity-100 translate-y-0 scale-100"
                leave-to-class="opacity-0 translate-y-2 scale-[0.98]"
              >
                <div
                  v-if="isSelectorOpen"
                  class="p-2 border-[1px] border-explore-border rounded-2xl border-solid bg-[#100c0e]/96 min-w-[19rem] shadow-[inset_0_1px_8px_rgba(255,255,255,0.05),0_28px_90px_rgba(0,0,0,0.72)] bottom-[calc(100%+0.75rem)] left-0 absolute z-30 backdrop-blur-2xl"
                  role="listbox"
                  aria-label="Roast level"
                >
                  <div class="px-3 pb-2 pt-1 flex items-center justify-between">
                    <p class="text-[9px] text-explore-muted tracking-[0.15em] font-meta uppercase">
                      Select roast level
                    </p>
                    <span class="text-[9px] text-signal-red-400 tracking-[0.12em] font-meta uppercase">01–04</span>
                  </div>
                  <button
                    v-for="level in ROAST_INTENSITY_LEVELS"
                    :key="level.value"
                    type="button"
                    role="option"
                    class="p-3 text-left rounded-xl flex gap-3 w-full transition-colors items-center hover:bg-white/6"
                    :class="level.value === roastStore.roastIntensity ? 'bg-white/7' : ''"
                    :aria-selected="level.value === roastStore.roastIntensity"
                    :data-testid="`test-2-intensity-${level.value}`"
                    @click="selectIntensity(level.value)"
                  >
                    <span class="rounded-lg bg-white/[0.035] shrink-0 grid h-9 w-9 place-items-center">
                      <Icon class="text-base" :class="level.value === roastStore.roastIntensity ? 'text-signal-red-400' : 'text-explore-muted'" name="ph:fire" />
                    </span>
                    <span class="flex-1 min-w-0">
                      <span class="text-sm text-explore-copy font-body block">{{ level.label }}</span>
                      <span class="text-[10px] text-explore-muted font-body mt-0.5 block">{{ intensityDescriptions[level.value] }}</span>
                    </span>
                    <Icon v-if="level.value === roastStore.roastIntensity" class="text-base text-signal-red-400 shrink-0" name="ph:check" />
                  </button>
                </div>
              </Transition>
            </div>
          </div>

          <button
            type="submit"
            data-testid="test-2-submit-button"
            class="group rounded-[0.85rem] shrink-0 grid h-11 w-11 transition-colors place-items-center sm:h-12 sm:w-12"
            :class="roastStore.canSubmit && !props.isPending ? 'text-white/95 bg-signal-red-700 hover:bg-signal-red-600' : 'text-explore-muted bg-white/7 cursor-not-allowed'"
            :disabled="!roastStore.canSubmit || props.isPending"
            aria-label="Start roast"
          >
            <Icon v-if="props.isPending" class="text-lg animate-spin" name="ph:circle-notch" />
            <Icon v-else class="text-lg transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" name="ph:arrow-up-right" />
          </button>
        </footer>
      </form>

      <div class="mt-5 px-2 flex gap-4 items-center justify-between">
        <p class="text-[9px] text-explore-muted tracking-[0.13em] font-meta uppercase sm:text-[10px]">
          Public commits only
        </p>
        <p class="text-[9px] text-explore-muted tracking-[0.13em] font-meta uppercase sm:text-[10px]">
          Enter to roast
        </p>
      </div>
    </div>
  </section>
</template>
