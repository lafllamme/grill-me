<script setup lang="ts">
import type { FuelRoastViewModel } from '~/models/rebrand-fuel'
import { computed, toRef } from 'vue'
import { Icon } from '#components'
import RebrandChapterMeta from '~/components/rebrand/RebrandChapterMeta.vue'
import RebrandProcessTrail from '~/components/rebrand/RebrandProcessTrail.vue'
import RebrandProgressiveText from '~/components/rebrand/RebrandProgressiveText.vue'
import RebrandReasoning from '~/components/rebrand/RebrandReasoning.vue'
import { usePacedRoastStatuses } from '~/composables/usePacedRoastStatuses'
import { useRoastReasoning } from '~/composables/useRoastReasoning'

const props = defineProps<{
  model: FuelRoastViewModel
  isActive: boolean
  isPreview?: boolean
  error: string | null
}>()

const hasVisibleResult = computed(() => props.isActive && props.model.hasResult)
const hasEvidence = computed(() => props.isActive && props.model.commits.length > 0)
const isReasoningActive = computed(() => props.model.isLive && !hasVisibleResult.value)
const pacedStatuses = usePacedRoastStatuses(toRef(() => props.model.statuses), 1200)
const reasoningSteps = useRoastReasoning(
  pacedStatuses,
  isReasoningActive,
  toRef(() => props.model.evidence),
)
const visibleCommits = computed(() => props.model.commits.slice(0, 3))
const visibleFiles = computed(() => props.model.files.slice(0, 5))
const visibleRoastLines = computed(() => props.model.roastLines.slice(0, 3))
const visibleFeedback = computed(() => props.model.feedback.slice(0, 3))
</script>

<template>
  <section
    data-testid="test-2-live-roast"
    class="mx-auto px-4 pb-36 pt-8 max-w-[96rem] scroll-mt-20 lg:px-10 sm:px-6 lg:pb-52"
    aria-live="polite"
  >
    <RebrandChapterMeta index="02" title="Evidence portfolio" />

    <div class="pt-20 gap-10 grid lg:pt-28 lg:grid-cols-[0.54fr_1.45fr_0.58fr]">
      <div class="self-start lg:top-28 lg:sticky" aria-label="Roast summary">
        <p class="text-[10px] text-basalt-500 tracking-[0.15em] font-meta uppercase">
          Current investigation
        </p>
        <div class="mt-6 pt-5 border-t-[1px] border-basalt-950/20 border-solid">
          <p class="text-[clamp(1.8rem,3vw,3rem)] text-basalt-950 leading-none tracking-[-0.035em] font-body">
            {{ model.username ? `@${model.username}` : 'Awaiting target' }}
          </p>
          <dl class="mt-8 space-y-4">
            <div class="flex gap-4 items-center justify-between">
              <dt class="text-xs text-basalt-500 font-body">
                Heat
              </dt>
              <dd class="text-[10px] text-signal-red-700 tracking-[0.12em] font-meta uppercase">
                {{ model.username ? model.intensityLabel : '—' }}
              </dd>
            </div>
            <div class="flex gap-4 items-center justify-between">
              <dt class="text-xs text-basalt-500 font-body">
                Status
              </dt>
              <dd class="text-[10px] text-basalt-950 tracking-[0.12em] font-meta uppercase">
                {{ model.isLive || model.hasResult ? model.stateLabel : 'Ready' }}
              </dd>
            </div>
          </dl>
        </div>
        <a v-if="hasVisibleResult" href="#fuel-verdict" class="text-sm text-basalt-950 font-body mt-20 pb-3 border-b-[1px] border-basalt-950 border-solid flex items-center justify-between">
          Read the verdict
          <Icon class="text-lg" name="ph:arrow-down-right" />
        </a>
      </div>

      <div class="space-y-[18svh]">
        <article class="text-explore-copy border-[1px] border-basalt-950/16 border-solid bg-basalt-950 min-h-[30rem] overflow-hidden fuel-sticky-settle lg:min-h-[44rem] motion-reduce:[animation:none] lg:top-20 lg:sticky">
          <div class="p-7 border-b-[1px] border-white/12 border-solid flex gap-4 items-center justify-between sm:p-9">
            <div>
              <p class="text-[10px] text-signal-red-400 tracking-[0.15em] font-meta uppercase">
                01 / Investigation
              </p>
              <h3 class="text-2xl text-explore-copy tracking-[-0.02em] font-body mt-2 sm:text-3xl">
                {{ model.username ? `Public trail for @${model.username}` : 'Ready to inspect a public trail' }}
              </h3>
            </div>
            <span class="text-[10px] text-explore-muted tracking-[0.12em] font-meta uppercase">
              {{ model.stateLabel }}
            </span>
          </div>

          <div class="p-7 sm:p-9">
            <div v-if="!props.isActive" class="text-sm text-explore-muted leading-relaxed font-body">
              Enter a GitHub username above to begin the evidence pass.
            </div>
            <RebrandReasoning v-else :username="model.username" :is-active="isReasoningActive" :has-result="hasVisibleResult">
              <RebrandProcessTrail :steps="reasoningSteps" :fallback="`Opening @${model.username}'s public commit trail`" />
              <p v-if="isPreview" class="text-[9px] text-explore-muted/55 tracking-[0.12em] font-meta mt-3 pl-12 uppercase">
                Local preview / production stream contract
              </p>
            </RebrandReasoning>
          </div>
        </article>

        <article v-if="hasEvidence" class="border-[1px] border-basalt-950/16 border-solid bg-[#fbfcfc] min-h-[30rem] fuel-sticky-settle lg:min-h-[44rem] motion-reduce:[animation:none] lg:top-24 lg:sticky">
          <header class="p-7 border-b-[1px] border-basalt-950/16 border-solid flex items-end justify-between sm:p-9">
            <div>
              <p class="text-[10px] text-signal-red-700 tracking-[0.15em] font-meta uppercase">
                02 / Selected commits
              </p>
              <h3 class="text-[clamp(2.4rem,4vw,4.2rem)] text-basalt-950 leading-[0.96] tracking-[-0.035em] font-body mt-5">
                Receipts, not vibes.
              </h3>
            </div>
            <p class="text-5xl text-basalt-950 leading-none font-body">
              {{ String(model.commits.length).padStart(2, '0') }}
            </p>
          </header>

          <TransitionGroup tag="div" enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
            <div v-for="(commit, index) in visibleCommits" :key="`${commit.repo}-${commit.sha}`" class="p-7 border-b-[1px] border-basalt-950/16 border-solid gap-5 grid sm:p-9 sm:grid-cols-[3rem_1fr_auto]">
              <span class="text-xs text-signal-red-700 font-mono">{{ String(index + 1).padStart(2, '0') }}</span>
              <div>
                <p class="text-xl text-basalt-950 leading-snug tracking-[-0.015em] font-body sm:text-2xl">
                  {{ commit.message }}
                </p>
                <p class="text-[10px] text-basalt-500 font-mono mt-3">
                  {{ commit.sha.slice(0, 7) }} · {{ commit.repo }} · {{ commit.changedFiles }} files
                </p>
              </div>
              <p class="text-xs text-signal-red-700 font-mono sm:text-right">
                +{{ commit.additions }} / -{{ commit.deletions }}
              </p>
            </div>
          </TransitionGroup>
        </article>

        <article v-if="hasEvidence && visibleFiles.length" class="text-explore-copy border-[1px] border-white/14 border-solid bg-black min-h-[30rem] fuel-sticky-settle lg:min-h-[44rem] motion-reduce:[animation:none] lg:top-28 lg:sticky">
          <header class="p-7 border-b-[1px] border-white/12 border-solid sm:p-9">
            <p class="text-[10px] text-signal-red-400 tracking-[0.15em] font-meta uppercase">
              03 / Files retained
            </p>
            <h3 class="text-[clamp(2.4rem,4vw,4.2rem)] text-explore-copy leading-[0.96] tracking-[-0.035em] font-body mt-5">
              Only the files that earned a seat.
            </h3>
          </header>
          <div class="p-7 sm:p-9">
            <TransitionGroup tag="div" class="border-t-[1px] border-white/12 border-solid" enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
              <div v-for="file in visibleFiles" :key="`${file.repo}-${file.sha}-${file.filename}`" class="py-5 border-b-[1px] border-white/12 border-solid">
                <div class="gap-4 grid sm:grid-cols-[minmax(0,1fr)_auto]">
                  <div>
                    <p class="text-sm text-explore-copy font-mono truncate sm:text-base">
                      {{ file.filename }}
                    </p>
                    <p class="text-[10px] text-explore-muted font-mono mt-2">
                      {{ file.repo }} · {{ file.status }}
                    </p>
                  </div>
                  <span class="text-xs text-signal-red-400 font-mono">+{{ file.additions }} / -{{ file.deletions }}</span>
                </div>
                <pre v-if="file.patch" class="text-[10px] text-explore-muted leading-relaxed font-mono mt-4 p-4 border-[1px] border-white/10 rounded-lg border-solid bg-white/[0.025] max-h-48 whitespace-pre-wrap overflow-auto">{{ file.patch }}</pre>
              </div>
            </TransitionGroup>
          </div>
        </article>

        <article v-if="hasVisibleResult" id="fuel-verdict" class="border-[1px] border-basalt-950/16 border-solid bg-signal-red-50 min-h-[34rem] fuel-sticky-settle lg:min-h-[48rem] motion-reduce:[animation:none] lg:top-32 lg:sticky">
          <header class="p-7 flex gap-8 items-start justify-between sm:p-9">
            <p class="text-[10px] text-signal-red-700 tracking-[0.15em] font-meta uppercase">
              04 / Filed verdict
            </p>
            <span class="text-[clamp(3.5rem,6vw,6rem)] text-signal-red-500 leading-none tracking-[-0.04em] font-body">
              {{ model.metrics?.grade ?? '—' }}
            </span>
          </header>
          <div class="px-7 pb-12 sm:px-9">
            <RebrandProgressiveText
              data-testid="test-2-roast-title"
              class="text-[clamp(2.7rem,4.6vw,5rem)] text-basalt-950 leading-[0.94] tracking-[-0.045em] font-display max-w-[14ch] block"
              as="h2"
              :text="model.title"
              :interval="46"
            />
            <div class="mt-12 gap-10 grid lg:grid-cols-[1.15fr_0.85fr]">
              <ol class="border-t-[1px] border-basalt-950/18 border-solid">
                <li v-for="(line, index) in visibleRoastLines" :key="`${index}-${line}`" class="py-5 border-b-[1px] border-basalt-950/18 border-solid gap-4 grid grid-cols-[2rem_1fr]">
                  <span class="text-xs text-signal-red-700 font-mono">{{ String(index + 1).padStart(2, '0') }}</span>
                  <p class="text-base text-basalt-800 leading-relaxed font-body sm:text-lg">
                    {{ line }}
                  </p>
                </li>
              </ol>
              <div v-if="visibleFeedback.length" class="pt-5 border-t-[1px] border-basalt-950/18 border-solid">
                <p class="text-[10px] text-basalt-500 tracking-[0.14em] font-meta uppercase">
                  Useful next moves
                </p>
                <ul class="mt-5 space-y-4">
                  <li v-for="item in visibleFeedback" :key="item" class="text-sm text-basalt-700 leading-relaxed font-body flex gap-3">
                    <span class="text-signal-red-700">↗</span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="self-start lg:top-28 lg:sticky" aria-label="Evidence index">
        <p class="text-[10px] text-basalt-500 tracking-[0.14em] font-meta uppercase">
          Evidence index
        </p>
        <dl class="mt-8 border-t-[1px] border-basalt-950/18 border-solid">
          <div class="py-4 border-b-[1px] border-basalt-950/18 border-solid flex items-end justify-between">
            <dt class="text-xs text-basalt-600 font-body">
              Stink score
            </dt>
            <dd class="text-3xl text-basalt-950 font-body">
              {{ model.metrics ? Math.round(model.metrics.stinkScore) : '—' }}
            </dd>
          </div>
          <div class="py-4 border-b-[1px] border-basalt-950/18 border-solid flex items-end justify-between">
            <dt class="text-xs text-basalt-600 font-body">
              Commits
            </dt>
            <dd class="text-3xl text-basalt-950 font-body">
              {{ model.commits.length ? String(model.commits.length).padStart(2, '0') : '—' }}
            </dd>
          </div>
          <div class="py-4 border-b-[1px] border-basalt-950/18 border-solid flex items-end justify-between">
            <dt class="text-xs text-basalt-600 font-body">
              Files
            </dt>
            <dd class="text-3xl text-basalt-950 font-body">
              {{ model.files.length ? String(model.files.length).padStart(2, '0') : '—' }}
            </dd>
          </div>
        </dl>
        <p class="text-xs text-basalt-500 leading-relaxed font-body mt-10">
          Scroll the center rail. The evidence remains ordered even while the verdict is still streaming.
        </p>
      </div>
    </div>

    <div v-if="error" data-testid="test-2-roast-error" class="mt-10 px-4 py-3 border-[1px] border-signal-red-700/30 border-solid bg-signal-red-50 flex gap-3 items-start">
      <Icon class="text-lg text-signal-red-700 mt-0.5 shrink-0" name="ph:warning-circle" />
      <p class="text-sm text-signal-red-900 leading-relaxed font-body">
        {{ error }}
      </p>
    </div>
  </section>
</template>
