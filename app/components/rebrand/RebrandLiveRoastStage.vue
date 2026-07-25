<script setup lang="ts">
import type { RoastMetrics, RoastStreamEvidenceEvent } from '~~/shared/roast/contracts'
import { computed, toRef } from 'vue'
import { Icon } from '#components'
import RebrandProcessTrail from '~/components/rebrand/RebrandProcessTrail.vue'
import RebrandProgressiveText from '~/components/rebrand/RebrandProgressiveText.vue'
import RebrandReasoning from '~/components/rebrand/RebrandReasoning.vue'
import { usePacedRoastStatuses } from '~/composables/usePacedRoastStatuses'
import { useRoastReasoning } from '~/composables/useRoastReasoning'

const props = defineProps<{
  username: string
  isPending: boolean
  isStreaming: boolean
  title: string
  roastLines: string[]
  feedback: string[]
  statuses: string[]
  error: string | null
  isPreview?: boolean
  evidence: RoastStreamEvidenceEvent | null
  metrics: RoastMetrics | null
}>()

const hasRoastContent = computed(() => Boolean(
  props.title || props.roastLines.length || props.feedback.length,
))

const isLive = computed(() => props.isPending || props.isStreaming)
const isReasoningActive = computed(() => isLive.value && !hasRoastContent.value)
const pacedStatuses = usePacedRoastStatuses(toRef(props, 'statuses'), 1200)
const reasoningSteps = useRoastReasoning(
  pacedStatuses,
  isReasoningActive,
  toRef(props, 'evidence'),
)
const commitCount = computed(() => props.evidence?.commits.length ?? 0)
const fileCount = computed(() => props.evidence?.commits.reduce((total, commit) => total + commit.files.length, 0) ?? 0)
const evidenceMetrics = computed(() => [
  { label: 'Stink score', value: props.metrics ? String(Math.round(props.metrics.stinkScore)) : '—' },
  { label: 'Commits reviewed', value: commitCount.value ? String(commitCount.value).padStart(2, '0') : '—' },
  { label: 'Files inspected', value: fileCount.value ? String(fileCount.value).padStart(2, '0') : '—' },
])
const evidenceReferences = computed(() => props.evidence?.commits.slice(0, 3).map(commit => ({
  key: `${commit.repo}-${commit.sha}`,
  sha: commit.sha.slice(0, 7),
  repo: commit.repo,
  message: commit.message || 'Commit message unavailable',
  delta: `+${commit.additions} / -${commit.deletions}`,
  changedFiles: `${commit.changedFiles} ${commit.changedFiles === 1 ? 'file' : 'files'}`,
})) ?? [])
</script>

<template>
  <section
    data-testid="test-2-live-roast"
    class="mx-auto px-4 py-24 max-w-[88rem] scroll-mt-20 lg:px-10 lg:py-36 sm:px-6"
    aria-live="polite"
  >
    <div class="mx-auto max-w-[76rem]">
      <header class="pb-6 border-b-[1px] border-explore-border border-solid flex gap-4 items-center justify-between sm:pb-8">
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

      <div class="py-8 border-b-[1px] border-explore-border border-solid sm:py-11">
        <RebrandReasoning :username="username" :is-active="isReasoningActive" :has-result="hasRoastContent">
          <RebrandProcessTrail :steps="reasoningSteps" :fallback="`Opening @${username}'s public commit trail`" />
          <p v-if="isPreview" class="text-[9px] text-explore-muted/50 tracking-[0.12em] font-meta mt-1 pl-12 uppercase sm:pl-14">
            Preview evidence · same public stream shape, local fixture values
          </p>
        </RebrandReasoning>
      </div>

      <Transition
        enter-active-class="transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        enter-from-class="opacity-0 translate-y-8"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div v-if="hasRoastContent" class="mt-3 gap-3 grid lg:grid-cols-12">
          <section class="p-7 border-[1px] border-explore-border rounded-[2rem] border-solid bg-explore-panel-high flex flex-col min-h-[20rem] justify-between sm:p-10 lg:col-span-7">
            <div class="flex gap-6 items-start justify-between">
              <div>
                <p class="text-[9px] text-signal-red-400 tracking-[0.15em] font-meta uppercase">
                  Verdict
                </p>
                <p class="text-[9px] text-explore-muted tracking-[0.1em] font-meta mt-2 uppercase">
                  @{{ username }} · public GitHub
                </p>
              </div>
              <Transition enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0 scale-90" enter-to-class="opacity-100 scale-100">
                <span v-if="metrics" class="text-6xl text-signal-red-400 leading-none tracking-[-0.07em] font-display sm:text-8xl">
                  {{ metrics.grade }}
                </span>
              </Transition>
            </div>
            <RebrandProgressiveText
              v-if="title"
              data-testid="test-2-roast-title"
              class="text-[clamp(2.5rem,4.2vw,4.75rem)] text-explore-copy leading-[0.9] tracking-[-0.055em] font-display mt-10 max-w-[14ch] block"
              as="h2"
              :text="title"
              :interval="46"
            />
          </section>

          <aside class="p-7 border-[1px] border-explore-border rounded-[2rem] border-solid bg-white/[0.025] min-h-[20rem] sm:p-9 lg:col-span-5">
            <p class="text-[9px] text-explore-muted tracking-[0.14em] font-meta uppercase">
              Evidence reviewed
            </p>
            <div class="mt-6 grid grid-cols-3">
              <div v-for="metric in evidenceMetrics" :key="metric.label" class="px-4 border-r-[1px] border-explore-border border-solid first:pl-0 last:pr-0 last:border-r-0">
                <p class="text-2xl text-explore-copy leading-none font-display sm:text-3xl">
                  {{ metric.value }}
                </p>
                <p class="text-[10px] text-explore-muted leading-tight font-body mt-2 sm:text-xs">
                  {{ metric.label }}
                </p>
              </div>
            </div>
            <div v-if="evidenceReferences.length" class="mt-7 border-t-[1px] border-explore-border border-solid">
              <div v-for="reference in evidenceReferences" :key="reference.key" class="py-4 border-b-[1px] border-explore-border border-solid last:border-b-0">
                <div class="flex gap-4 items-center justify-between">
                  <span class="text-[11px] text-signal-red-400 font-mono">{{ reference.sha }}</span>
                  <span class="text-[11px] text-signal-red-400 font-mono shrink-0">{{ reference.delta }}</span>
                </div>
                <p class="text-sm text-explore-copy/90 leading-snug font-body mt-2 line-clamp-2 sm:text-base">
                  {{ reference.message }}
                </p>
                <div class="text-[10px] text-explore-muted font-mono mt-2 flex gap-3 items-center justify-between">
                  <span class="truncate">{{ reference.repo }}</span>
                  <span class="shrink-0">{{ reference.changedFiles }}</span>
                </div>
              </div>
            </div>
          </aside>

          <section v-if="roastLines.length" class="p-7 border-[1px] border-explore-border rounded-[2rem] border-solid bg-black/55 sm:p-10 lg:col-span-12">
            <div class="gap-10 grid lg:gap-14 lg:grid-cols-[1.25fr_0.75fr]">
              <div>
                <p class="text-[9px] text-signal-red-400 tracking-[0.14em] font-meta uppercase">
                  Findings
                </p>
                <TransitionGroup tag="div" class="mt-5 border-t-[1px] border-explore-border border-solid" enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
                  <div v-for="(line, index) in roastLines" :key="`${index}-${line}`" class="py-5 border-b-[1px] border-explore-border border-solid gap-4 grid grid-cols-[auto_minmax(0,1fr)] last:border-b-0">
                    <span class="text-sm text-signal-red-500 font-mono pt-0.5">{{ String(index + 1).padStart(2, '0') }}</span>
                    <RebrandProgressiveText class="text-base text-explore-copy/88 leading-relaxed font-body sm:text-lg" as="p" :text="line" :interval="26" :words-per-tick="2" />
                  </div>
                </TransitionGroup>
              </div>
              <Transition enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
                <div v-if="feedback.length">
                  <p class="text-[9px] text-signal-red-400 tracking-[0.14em] font-meta uppercase">
                    Recommended fixes
                  </p>
                  <TransitionGroup tag="div" class="mt-5 space-y-4" enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0 translate-y-3">
                    <div v-for="(item, index) in feedback" :key="`${index}-${item}`" class="text-base text-explore-copy/78 leading-relaxed font-body flex gap-3 sm:text-lg">
                      <Icon class="text-base text-signal-red-400 mt-1.5 shrink-0" name="ph:arrow-up-right" />
                      <RebrandProgressiveText as="span" :text="item" :interval="24" :words-per-tick="2" />
                    </div>
                  </TransitionGroup>
                </div>
              </Transition>
            </div>
          </section>
        </div>
      </Transition>

      <div v-if="error" data-testid="test-2-roast-error" class="mt-10 px-4 py-3 border-[1px] border-signal-red-500/30 rounded-xl border-solid bg-signal-red-950/45 flex gap-3 items-start">
        <Icon class="text-lg text-signal-red-400 mt-0.5 shrink-0" name="ph:warning-circle" />
        <p class="text-sm text-signal-red-200 leading-relaxed font-body">
          {{ error }}
        </p>
      </div>
    </div>
  </section>
</template>
