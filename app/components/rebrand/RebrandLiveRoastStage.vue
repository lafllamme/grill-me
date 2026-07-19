<script setup lang="ts">
import { useNow } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { Icon } from '#components'
import RebrandProgressiveText from '~/components/rebrand/RebrandProgressiveText.vue'

const props = defineProps<{
  username: string
  isPending: boolean
  isStreaming: boolean
  title: string
  roastLines: string[]
  feedback: string[]
  statuses: string[]
  error: string | null
}>()

const startedAt = ref(Date.now())
const now = useNow({ interval: 1000 })
const isReasoningOpen = ref(true)

const hasRoastContent = computed(() => Boolean(
  props.title || props.roastLines.length || props.feedback.length,
))

const isLive = computed(() => props.isPending || props.isStreaming)
const elapsedSeconds = computed(() => Math.max(1, Math.round((now.value.getTime() - startedAt.value) / 1000)))

const normalizedStatuses = computed(() => props.statuses.map((status) => {
  const separatorIndex = status.indexOf('] ')
  const hasPhasePrefix = status.startsWith('[') && separatorIndex > 1

  return {
    phase: hasPhasePrefix ? status.slice(1, separatorIndex).replaceAll('_', ' ') : 'processing',
    message: hasPhasePrefix ? status.slice(separatorIndex + 2) : status,
  }
}))

const latestStatus = computed(() => normalizedStatuses.value.at(-1)?.message
  || `Opening @${props.username}'s public commit trail`)

const reasoningLabel = computed(() => isLive.value
  ? `Investigating @${props.username}`
  : `Thought for ${elapsedSeconds.value} ${elapsedSeconds.value === 1 ? 'second' : 'seconds'}`)

watch(isLive, (isActive, wasActive) => {
  if (isActive) {
    if (!wasActive)
      startedAt.value = Date.now()

    isReasoningOpen.value = true
    return
  }

  if (wasActive && hasRoastContent.value)
    isReasoningOpen.value = false
})
</script>

<template>
  <section
    data-testid="test-2-live-roast"
    class="mx-auto px-4 py-24 max-w-[88rem] scroll-mt-20 lg:px-10 lg:py-36 sm:px-6"
    aria-live="polite"
  >
    <div
      class="mx-auto border-[1px] border-explore-border rounded-[2rem] border-solid bg-black/66 max-w-[76rem] min-h-[20rem] shadow-[inset_0_1px_12px_rgba(255,255,255,0.055),0_44px_160px_rgba(48,0,8,0.52)] transition-[min-height,transform,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden backdrop-blur-2xl sm:rounded-[2.75rem]"
      :class="hasRoastContent ? 'min-h-[42rem] border-explore-border-high' : 'scale-[0.985]'"
    >
      <header class="px-6 py-5 border-b-[1px] border-explore-border border-solid flex gap-4 items-center justify-between sm:px-9 sm:py-7">
        <div class="flex gap-3 min-w-0 items-center">
          <span class="border-[1px] border-signal-red-500/25 rounded-full border-solid bg-signal-red-950/65 shrink-0 grid h-9 w-9 place-items-center">
            <Icon class="text-base text-signal-red-400" :class="isLive ? 'animate-pulse' : ''" name="ph:flame" />
          </span>
          <div class="min-w-0">
            <p class="text-[9px] text-explore-muted tracking-[0.16em] font-meta uppercase sm:text-[10px]">
              Live roast / public evidence
            </p>
            <p class="text-sm text-explore-copy font-body mt-1 truncate">
              @{{ username }}
            </p>
          </div>
        </div>
        <span class="text-[9px] tracking-[0.14em] font-meta uppercase sm:text-[10px]" :class="isLive ? 'text-signal-red-400' : 'text-explore-muted'">
          {{ isLive ? 'Live' : error ? 'Interrupted' : 'Filed' }}
        </span>
      </header>

      <div class="px-6 py-8 lg:px-12 lg:py-14 sm:px-9 sm:py-11">
        <button
          type="button"
          data-testid="test-2-reasoning-trigger"
          class="group text-left flex gap-3 max-w-full items-center"
          :aria-expanded="isReasoningOpen"
          @click="isReasoningOpen = !isReasoningOpen"
        >
          <Icon class="text-base text-signal-red-400 shrink-0" :class="isLive ? 'animate-pulse' : ''" name="ph:sparkle" />
          <span class="text-sm font-body truncate relative sm:text-base" :class="isLive ? 'text-explore-muted/65' : 'text-explore-muted group-hover:text-explore-copy'">
            <span>{{ reasoningLabel }}</span>
            <span v-if="isLive" aria-hidden="true" class="text-shimmer-signal inset-0 absolute">
              {{ reasoningLabel }}
            </span>
          </span>
          <Icon class="text-sm text-explore-muted shrink-0 transition-transform duration-300" :class="isReasoningOpen ? 'rotate-180' : ''" name="ph:caret-down" />
        </button>

        <div class="grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" :class="isReasoningOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
          <div class="overflow-hidden">
            <div class="ml-2 pl-6 pt-6 border-l-[1px] border-explore-border border-solid space-y-4">
              <TransitionGroup
                enter-active-class="transition duration-500 ease-out"
                enter-from-class="opacity-0 translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
              >
                <div v-for="(status, index) in normalizedStatuses" :key="`${status.phase}-${index}`" class="flex gap-3 items-start">
                  <span class="mt-1.5 rounded-full shrink-0 h-1.5 w-1.5" :class="index === normalizedStatuses.length - 1 && isLive ? 'bg-signal-red-400 shadow-[0_0_14px_rgba(240,68,77,0.75)]' : 'bg-explore-muted/45'" />
                  <div>
                    <p class="text-[9px] text-explore-muted/60 tracking-[0.12em] font-meta uppercase">
                      {{ status.phase }}
                    </p>
                    <p class="text-sm text-explore-muted leading-relaxed font-body mt-1">
                      {{ status.message }}
                    </p>
                  </div>
                </div>
              </TransitionGroup>

              <div v-if="normalizedStatuses.length === 0" class="flex gap-3 items-start">
                <span class="mt-1.5 rounded-full bg-signal-red-400 shrink-0 h-1.5 w-1.5 animate-pulse" />
                <p class="text-sm text-explore-muted leading-relaxed font-body">
                  {{ latestStatus }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Transition
          enter-active-class="transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          enter-from-class="opacity-0 translate-y-8"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div v-if="hasRoastContent" class="pt-14 sm:pt-20">
            <p class="text-[10px] text-signal-red-400 tracking-[0.18em] font-meta uppercase">
              The verdict
            </p>
            <RebrandProgressiveText
              v-if="title"
              data-testid="test-2-roast-title"
              class="text-[clamp(2.8rem,7vw,7.2rem)] text-explore-copy leading-[0.86] tracking-[-0.065em] font-display mt-6 max-w-[12ch] block"
              as="h2"
              :text="title"
              :interval="46"
            />

            <TransitionGroup
              tag="div"
              class="mt-12 max-w-[62rem] space-y-5 sm:mt-16 sm:space-y-7"
              enter-active-class="transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              enter-from-class="opacity-0 translate-y-6 blur-sm"
              enter-to-class="opacity-100 translate-y-0 blur-0"
            >
              <div
                v-for="(line, index) in roastLines"
                :key="`${index}-${line}`"
                class="text-xl text-explore-copy/88 leading-relaxed tracking-[-0.025em] font-body lg:text-3xl sm:text-2xl"
              >
                <span class="text-signal-red-500 font-mono mr-3">{{ String(index + 1).padStart(2, '0') }}</span>
                <RebrandProgressiveText as="span" :text="line" :interval="26" :words-per-tick="2" />
              </div>
            </TransitionGroup>

            <div v-if="feedback.length" class="mt-16 pt-8 border-t-[1px] border-explore-border border-solid sm:mt-20 sm:pt-10">
              <p class="text-[10px] text-explore-muted tracking-[0.16em] font-meta uppercase">
                Useful damage
              </p>
              <TransitionGroup tag="ul" class="mt-6 gap-4 grid md:grid-cols-2" enter-active-class="transition duration-500" enter-from-class="opacity-0 translate-y-3">
                <li v-for="(item, index) in feedback" :key="`${index}-${item}`" class="text-sm text-explore-muted leading-relaxed font-body flex gap-3 sm:text-base">
                  <Icon class="text-base text-signal-red-400 mt-0.5 shrink-0" name="ph:arrow-up-right" />
                  <RebrandProgressiveText as="span" :text="item" :interval="24" :words-per-tick="2" />
                </li>
              </TransitionGroup>
            </div>
          </div>
        </Transition>

        <div v-if="error" data-testid="test-2-roast-error" class="mt-10 px-4 py-3 border-[1px] border-signal-red-500/30 rounded-xl border-solid bg-signal-red-950/45 flex gap-3 items-start">
          <Icon class="text-lg text-signal-red-400 mt-0.5 shrink-0" name="ph:warning-circle" />
          <p class="text-sm text-signal-red-200 leading-relaxed font-body">
            {{ error }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
