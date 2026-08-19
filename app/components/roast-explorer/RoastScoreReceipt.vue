<script setup lang="ts">
import { roastMetricDescriptors, type RoastExplorerFixture } from '~/data/roast-explorer'
import { computed } from 'vue'

const props = defineProps<{
  fixture: RoastExplorerFixture
  revealPhase: number
}>()

const isPrinting = computed(() => props.revealPhase >= 1)
const isEvidenceVisible = computed(() => props.revealPhase >= 2)
const areScoresVisible = computed(() => props.revealPhase >= 4)
const isGradeVisible = computed(() => props.revealPhase >= 5)
const commitCount = computed(() => props.fixture.meta.selectedCommitCount ?? props.fixture.meta.commitCount)
const fileCount = computed(() => new Set(props.fixture.evidence.commits.flatMap(commit => commit.files)).size)
const intensity = computed(() => props.fixture.intensity.label.replaceAll('_', ' '))
const receiptId = computed(() => `${String(props.fixture.intensity.level).padStart(2, '0')}-${String(commitCount.value).padStart(2, '0')}`)
const barcodeWidths = [2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 1, 3] as const
const tornClipPath = 'polygon(0 0, 100% 0, 100% 98%, 97% 100%, 94% 98%, 91% 100%, 88% 98%, 85% 100%, 82% 98%, 79% 100%, 76% 98%, 73% 100%, 70% 98%, 67% 100%, 64% 98%, 61% 100%, 58% 98%, 55% 100%, 52% 98%, 49% 100%, 46% 98%, 43% 100%, 40% 98%, 37% 100%, 34% 98%, 31% 100%, 28% 98%, 25% 100%, 22% 98%, 19% 100%, 16% 98%, 13% 100%, 10% 98%, 7% 100%, 4% 98%, 0 100%)'
</script>

<template>
  <section
    class="relative min-h-[25rem] overflow-hidden rounded-[1.5rem] bg-surface-container-low p-2 sm:p-3"
    data-testid="roast-score-receipt"
    aria-live="polite"
    aria-label="Roast score receipt"
  >
    <div
      class="mx-auto w-full max-w-[17rem] origin-top bg-bone-100 px-5 pb-7 pt-4 text-basalt-950 shadow-lg transition-[clip-path,opacity,transform] duration-[1300ms] ease-out motion-reduce:transition-none"
      :class="isPrinting ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'"
      :style="{ clipPath: isPrinting ? tornClipPath : 'inset(0 0 100% 0)' }"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-primary" />
          <span class="font-meta text-[11px] tracking-[0.12em] uppercase">GRILLME</span>
        </div>
        <span class="font-meta text-[8px] tracking-[0.16em] uppercase opacity-60">
          {{ isGradeVisible ? 'Filed' : 'Printing' }}
        </span>
      </div>

      <div class="mt-4 text-center">
        <p class="font-meta text-[11px] tracking-[0.2em] uppercase">Score receipt</p>
        <p class="mt-1 font-meta text-[8px] tracking-[0.14em] uppercase opacity-60">
          Evidence / verdict
        </p>
      </div>

      <div class="my-4 border-t border-dashed border-basalt-950/35" />

      <div class="space-y-2 font-meta text-[9px]">
        <div class="flex items-center justify-between">
          <span class="tracking-[0.12em] uppercase opacity-60">Intensity</span>
          <span class="tracking-[0.08em] uppercase">{{ isEvidenceVisible ? intensity : '—' }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="tracking-[0.12em] uppercase opacity-60">Evidence</span>
          <span class="tracking-[0.08em] uppercase">{{ isEvidenceVisible ? `${commitCount} commits` : '—' }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="tracking-[0.12em] uppercase opacity-60">Files</span>
          <span class="tracking-[0.08em] uppercase">{{ isEvidenceVisible ? fileCount : '—' }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="tracking-[0.12em] uppercase opacity-60">Order #</span>
          <span class="tracking-[0.08em] uppercase">{{ receiptId }}</span>
        </div>
      </div>

      <div class="my-4 border-t border-dashed border-basalt-950/35" />

      <div class="space-y-2.5 font-meta text-[9px]">
        <div
          v-for="(metric, index) in roastMetricDescriptors"
          :key="metric.key"
          class="flex items-center justify-between transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none"
          :class="areScoresVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'"
          :style="{ transitionDelay: `${index * 90}ms` }"
        >
          <span class="tracking-[0.12em] uppercase opacity-60">{{ metric.label }}</span>
          <span class="text-[11px]">{{ areScoresVisible ? props.fixture.metrics[metric.key] : '—' }}</span>
        </div>
      </div>

      <div class="my-4 border-t border-dashed border-basalt-950/35" />

      <div class="flex items-center justify-between font-meta text-[9px]">
        <span class="tracking-[0.12em] uppercase opacity-60">Grade</span>
        <span class="text-[14px] text-primary">{{ isGradeVisible ? props.fixture.metrics.grade : '—' }}</span>
      </div>

      <div class="mt-5 flex justify-center">
        <div
          class="flex h-14 w-14 items-center justify-center rounded-full border-[1px] border-primary font-meta text-[14px] text-primary transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none"
          :class="isGradeVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'"
        >
          {{ isGradeVisible ? props.fixture.metrics.grade : '—' }}
        </div>
      </div>

      <div
        class="mt-5 flex h-7 items-end justify-center gap-[2px] transition-opacity duration-500 motion-reduce:transition-none"
        :class="isGradeVisible ? 'opacity-60' : 'opacity-0'"
      >
        <span
          v-for="(width, index) in barcodeWidths"
          :key="index"
          class="h-full bg-basalt-950"
          :style="{ width: `${width}px` }"
        />
      </div>

      <div class="mt-3 text-center font-meta text-[8px] tracking-[0.16em] uppercase opacity-55">
        Filed / no refunds
      </div>
    </div>
  </section>
</template>
