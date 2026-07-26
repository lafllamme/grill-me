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
const isReasoningActive = computed(() => props.model.isLive && !hasVisibleResult.value)
const pacedStatuses = usePacedRoastStatuses(toRef(() => props.model.statuses), 1200)
const reasoningSteps = useRoastReasoning(
  pacedStatuses,
  isReasoningActive,
  toRef(() => props.model.evidence),
)
const visibleCommits = computed(() => props.model.commits.slice(0, 3))
const visibleFiles = computed(() => props.model.files.slice(0, 5))
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
        <p class="text-[clamp(3.5rem,6vw,6.5rem)] text-basalt-950 leading-none tracking-[-0.07em] font-display">
          {{ model.metrics.grade }}
        </p>
        <div class="mt-8 pt-5 border-t-[1px] border-basalt-950/20 border-solid">
          <p class="text-lg text-basalt-950 font-body">
            @{{ model.username }}
          </p>
          <p class="text-[10px] text-signal-red-700 tracking-[0.14em] font-meta mt-2 uppercase">
            {{ model.intensityLabel }} / {{ model.stateLabel }}
          </p>
        </div>
        <a href="#fuel-verdict" class="text-sm text-basalt-950 font-body mt-20 pb-3 border-b-[1px] border-basalt-950 border-solid flex items-center justify-between">
          Read the verdict
          <Icon class="text-lg" name="ph:arrow-down-right" />
        </a>
      </div>

      <div class="space-y-[22svh]">
        <article class="text-explore-copy border-[1px] border-basalt-950/16 border-solid bg-basalt-950 min-h-[42rem] top-20 sticky overflow-hidden">
          <div class="p-7 border-b-[1px] border-white/12 border-solid flex gap-4 items-center justify-between sm:p-9">
            <div>
              <p class="text-[10px] text-signal-red-400 tracking-[0.15em] font-meta uppercase">
                01 / Investigation
              </p>
              <h3 class="text-2xl text-explore-copy tracking-[-0.035em] font-display mt-2 sm:text-3xl">
                Public trail for @{{ model.username }}
              </h3>
            </div>
            <span class="text-[10px] text-explore-muted tracking-[0.12em] font-meta uppercase">
              {{ model.stateLabel }}
            </span>
          </div>

          <div class="p-7 sm:p-9">
            <RebrandReasoning :username="model.username" :is-active="isReasoningActive" :has-result="hasVisibleResult">
              <RebrandProcessTrail :steps="reasoningSteps" :fallback="`Opening @${model.username}'s public commit trail`" />
              <p v-if="isPreview" class="text-[9px] text-explore-muted/55 tracking-[0.12em] font-meta mt-3 pl-12 uppercase">
                Local preview / production stream contract
              </p>
            </RebrandReasoning>
          </div>
        </article>

        <article class="border-[1px] border-basalt-950/16 border-solid bg-bone-100 min-h-[42rem] top-24 sticky">
          <header class="p-7 border-b-[1px] border-basalt-950/16 border-solid flex items-end justify-between sm:p-9">
            <div>
              <p class="text-[10px] text-signal-red-700 tracking-[0.15em] font-meta uppercase">
                02 / Selected commits
              </p>
              <h3 class="text-[clamp(2.4rem,4vw,4.5rem)] text-basalt-950 leading-[0.9] tracking-[-0.055em] font-display mt-5">
                Receipts, not vibes.
              </h3>
            </div>
            <p class="text-5xl text-basalt-950 leading-none font-display">
              {{ String(model.commits.length).padStart(2, '0') }}
            </p>
          </header>

          <div>
            <div v-for="(commit, index) in visibleCommits" :key="`${commit.repo}-${commit.sha}`" class="p-7 border-b-[1px] border-basalt-950/16 border-solid gap-5 grid sm:p-9 sm:grid-cols-[3rem_1fr_auto]">
              <span class="text-xs text-signal-red-700 font-mono">{{ String(index + 1).padStart(2, '0') }}</span>
              <div>
                <p class="text-xl text-basalt-950 leading-tight tracking-[-0.025em] font-body sm:text-2xl">
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
          </div>
        </article>

        <article class="text-explore-copy border-[1px] border-white/14 border-solid bg-black min-h-[42rem] top-28 sticky">
          <header class="p-7 border-b-[1px] border-white/12 border-solid sm:p-9">
            <p class="text-[10px] text-signal-red-400 tracking-[0.15em] font-meta uppercase">
              03 / Prompt context
            </p>
            <h3 class="text-[clamp(2.4rem,4vw,4.5rem)] text-explore-copy leading-[0.9] tracking-[-0.055em] font-display mt-5">
              Only the files that earned a seat.
            </h3>
          </header>
          <div class="p-7 sm:p-9">
            <div class="border-t-[1px] border-white/12 border-solid">
              <div v-for="file in visibleFiles" :key="`${file.repo}-${file.sha}-${file.filename}`" class="py-5 border-b-[1px] border-white/12 border-solid gap-4 grid sm:grid-cols-[minmax(0,1fr)_auto]">
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
            </div>
          </div>
        </article>

        <article id="fuel-verdict" class="border-[1px] border-basalt-950/16 border-solid bg-signal-red-50 min-h-[42rem] top-32 sticky">
          <header class="p-7 flex gap-8 items-start justify-between sm:p-9">
            <p class="text-[10px] text-signal-red-700 tracking-[0.15em] font-meta uppercase">
              04 / Filed verdict
            </p>
            <span class="text-[clamp(4rem,7vw,7rem)] text-signal-red-500 leading-none tracking-[-0.08em] font-display">
              {{ model.metrics.grade }}
            </span>
          </header>
          <div class="px-7 pb-10 sm:px-9">
            <RebrandProgressiveText
              data-testid="test-2-roast-title"
              class="text-[clamp(2.8rem,5vw,5.5rem)] text-basalt-950 leading-[0.87] tracking-[-0.065em] font-display max-w-[12ch] block"
              as="h2"
              :text="model.title"
              :interval="46"
            />
            <p class="text-lg text-basalt-700 leading-relaxed font-body mt-10 max-w-[34rem] sm:text-xl">
              {{ model.roastLines[0] }}
            </p>
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
            <dd class="text-3xl text-basalt-950 font-display">
              {{ Math.round(model.metrics.stinkScore) }}
            </dd>
          </div>
          <div class="py-4 border-b-[1px] border-basalt-950/18 border-solid flex items-end justify-between">
            <dt class="text-xs text-basalt-600 font-body">
              Commits
            </dt>
            <dd class="text-3xl text-basalt-950 font-display">
              {{ String(model.commits.length).padStart(2, '0') }}
            </dd>
          </div>
          <div class="py-4 border-b-[1px] border-basalt-950/18 border-solid flex items-end justify-between">
            <dt class="text-xs text-basalt-600 font-body">
              Files
            </dt>
            <dd class="text-3xl text-basalt-950 font-display">
              {{ String(model.files.length).padStart(2, '0') }}
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
