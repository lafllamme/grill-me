<script setup lang="ts">
import type { RoastExplorerLevel } from '~/data/roast-explorer'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useHead, useSeoMeta } from '#imports'
import RoastDissTrack from '~/components/roast-explorer/RoastDissTrack.vue'
import RoastEvidenceDeck from '~/components/roast-explorer/RoastEvidenceDeck.vue'
import RoastEvidenceDrawer from '~/components/roast-explorer/RoastEvidenceDrawer.vue'
import RoastKnockoutCard from '~/components/roast-explorer/RoastKnockoutCard.vue'
import RoastMetricStrip from '~/components/roast-explorer/RoastMetricStrip.vue'
import RoastReceipt from '~/components/roast-explorer/RoastReceipt.vue'
import RoastReel from '~/components/roast-explorer/RoastReel.vue'
import { roastExplorerFixtures, roastExplorerLevels } from '~/data/roast-explorer'

type RoastVariant = 'evidence' | 'receipt' | 'diss' | 'knockout' | 'reel'

const activeLevel = ref<RoastExplorerLevel>('medium_rare')
const activeVariant = ref<RoastVariant>('knockout')
const isStreaming = ref(true)
const showEvidence = ref(false)
const replayKey = ref(0)
const isHydrated = ref(false)
let replayTimer: ReturnType<typeof setTimeout> | undefined

const fixture = computed(() => roastExplorerFixtures[activeLevel.value])
const variantOptions: Array<{ id: RoastVariant, label: string, note: string }> = [
  { id: 'evidence', label: '01 / Evidence deck', note: 'cards' },
  { id: 'receipt', label: '02 / Roast receipt', note: 'printed damage' },
  { id: 'diss', label: '03 / Diss track', note: 'tracklist' },
  { id: 'knockout', label: '04 / Knockout card', note: 'rounds' },
  { id: 'reel', label: '05 / Roast reel', note: 'tap-through' },
]
const activeComponent = computed(() => ({
  evidence: RoastEvidenceDeck,
  receipt: RoastReceipt,
  diss: RoastDissTrack,
  knockout: RoastKnockoutCard,
  reel: RoastReel,
}[activeVariant.value]))
const variantLabel = computed(() => variantOptions.find(option => option.id === activeVariant.value)?.label ?? '')

function selectLevel(level: RoastExplorerLevel) {
  activeLevel.value = level
  startStreamingTimer()
  replayKey.value += 1
  showEvidence.value = false
}

function selectVariant(variant: RoastVariant) {
  activeVariant.value = variant
  startStreamingTimer()
  replayKey.value += 1
}

function startStreamingTimer() {
  if (replayTimer)
    clearTimeout(replayTimer)
  isStreaming.value = true
  replayTimer = setTimeout(() => {
    isStreaming.value = false
  }, 7200)
}

function replay() {
  if (!import.meta.client)
    return
  startStreamingTimer()
  replayKey.value += 1
}

onBeforeUnmount(() => {
  if (replayTimer)
    clearTimeout(replayTimer)
})

onMounted(() => {
  isHydrated.value = true
  startStreamingTimer()
})

useHead({ title: 'Roast Explorer' })
useSeoMeta({
  title: 'Roast Explorer · grillme',
  description: 'Five visual directions for the evidence-backed Grillme roast.',
})
</script>

<template>
  <div class="text-on-background bg-background min-h-[100dvh] overflow-x-hidden">
    <main class="mx-auto px-5 pb-24 pt-4 max-w-[1440px] relative lg:px-12 sm:px-8" :data-roast-explorer-ready="isHydrated ? 'true' : 'false'">
      <section class="py-4 border-b-[1px] border-divider border-solid gap-5 grid lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
            Roast intensity
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <button v-for="level in roastExplorerLevels" :key="level.value" type="button" class="text-[10px] tracking-[0.12em] font-meta px-3 py-2 border-[1px] border-solid uppercase transition-colors duration-300" :class="activeLevel === level.value ? 'border-primary bg-primary text-background' : 'border-divider bg-surface text-on-surface-variant hover:border-primary/50'" @click="selectLevel(level.value)">
              {{ level.label }}
            </button>
          </div>
        </div>
        <div class="flex gap-3 items-center">
          <span class="text-[10px] text-primary tracking-[0.12em] font-meta uppercase">{{ isStreaming ? 'streaming' : 'filed' }}</span>
        </div>
      </section>

      <section class="py-5">
        <div class="flex flex-wrap gap-2" role="tablist" aria-label="Roast visual variants">
          <button v-for="option in variantOptions" :id="`tab-${option.id}`" :key="option.id" type="button" role="tab" :aria-selected="activeVariant === option.id" class="px-4 py-3 text-left border-[1px] border-solid transition-colors duration-300" :class="activeVariant === option.id ? 'border-primary bg-primary-container' : 'border-divider bg-surface hover:border-primary/40'" @click="selectVariant(option.id)">
            <span class="text-xs text-on-surface font-body block">{{ option.label }}</span><span class="text-[9px] text-on-surface-variant tracking-[0.15em] font-meta mt-1 block uppercase">{{ option.note }}</span>
          </button>
        </div>
        <div class="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-wrap gap-3 items-center">
            <p class="text-sm text-on-surface-variant font-body">
              Active direction: <span class="text-on-surface">{{ variantLabel }}</span>
            </p>
            <button type="button" class="text-[10px] text-on-surface-variant tracking-[0.12em] font-meta px-4 py-2 border border-divider rounded-full border-solid hover:text-on-surface hover:border-primary" @click="replay">
              Replay entrance
            </button>
          </div>
          <div class="max-w-xl w-full sm:w-auto">
            <RoastMetricStrip :fixture="fixture" :is-streaming="isStreaming" />
          </div>
        </div>
      </section>

      <section :key="`${activeLevel}-${activeVariant}-${replayKey}`" class="border-[1px] border-divider rounded-[1.5rem] border-solid bg-surface-container-low overflow-hidden" role="tabpanel" :aria-labelledby="`tab-${activeVariant}`">
        <component :is="activeComponent" :fixture="fixture" :replay-key="replayKey" :is-streaming="isStreaming" />
        <div class="px-5 pb-5 sm:px-8 sm:pb-8">
          <button type="button" class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta px-4 py-3 border-[1px] border-outline border-solid uppercase hover:text-on-surface hover:border-primary" @click="showEvidence = !showEvidence">
            {{ showEvidence ? 'Hide evidence' : 'Show evidence' }} <span class="text-primary ml-2">{{ showEvidence ? '−' : '+' }}</span>
          </button>
        </div>
        <RoastEvidenceDrawer :fixture="fixture" :open="showEvidence" @toggle="showEvidence = false" />
      </section>

      <footer class="pt-8 flex gap-4 items-start justify-between">
        <p class="text-[10px] text-on-surface-variant leading-relaxed font-meta max-w-[68ch]">
          Exploration only. All five views consume the same RoastResponse-shaped fixture, so the selected direction can later connect to the live stream without changing its visual contract.
        </p><span class="text-[10px] text-primary tracking-[0.16em] font-meta hidden uppercase sm:block">{{ activeLevel }} · {{ activeVariant }}</span>
      </footer>
    </main>
  </div>
</template>
