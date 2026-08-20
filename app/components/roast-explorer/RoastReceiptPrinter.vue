<script setup lang="ts">
import type { RoastExplorerFixture } from '~/data/roast-explorer'
import { computed } from 'vue'

const props = defineProps<{
  fixture: RoastExplorerFixture
  revealPhase: number
}>()

const isEvidenceVisible = computed(() => props.revealPhase >= 2)
const areScoresVisible = computed(() => props.revealPhase >= 4)
const isGradeVisible = computed(() => props.revealPhase >= 5)
const isFiled = computed(() => props.revealPhase >= 5)
const commitCount = computed(() => props.fixture.meta.selectedCommitCount ?? props.fixture.meta.commitCount)
const fileCount = computed(() => new Set(props.fixture.evidence.commits.flatMap(commit => commit.files.map(file => file.filename))).size)
const intensity = computed(() => props.fixture.intensity.label.replaceAll('_', ' '))
const receiptId = computed(() => `${String(props.fixture.intensity.level).padStart(2, '0')}-${String(commitCount.value).padStart(2, '0')}`)
const receiptItems = computed(() => [
  { label: 'Stink', amount: props.fixture.metrics.stinkScore },
  { label: 'Spaghetti', amount: props.fixture.metrics.spaghettiIndex },
  { label: 'Ego damage', amount: props.fixture.metrics.egoDamage },
])
const receiptTotal = computed(() => receiptItems.value.reduce((total, item) => total + item.amount, 0))
const paperTranslate = computed(() => {
  if (props.revealPhase >= 5)
    return 'translateY(0rem)'
  if (props.revealPhase >= 4)
    return 'translateY(-10rem)'
  if (props.revealPhase >= 3)
    return 'translateY(-19rem)'
  if (props.revealPhase >= 2)
    return 'translateY(-28rem)'
  if (props.revealPhase >= 1)
    return 'translateY(-38rem)'
  return 'translateY(-40rem)'
})

const barcodeWidths = [2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 1, 3] as const
const tornEdgeClipPath = 'polygon(0 0, 100% 0, 100% 98%, 97% 100%, 94% 98%, 91% 100%, 88% 98%, 85% 100%, 82% 98%, 79% 100%, 76% 98%, 73% 100%, 70% 98%, 67% 100%, 64% 98%, 61% 100%, 58% 98%, 55% 100%, 52% 98%, 49% 100%, 46% 98%, 43% 100%, 40% 98%, 37% 100%, 34% 98%, 31% 100%, 28% 98%, 25% 100%, 22% 98%, 19% 100%, 16% 98%, 13% 100%, 10% 98%, 7% 100%, 4% 98%, 0 100%)'
</script>

<template>
  <section
    class="p-0 border-[1px] border-basalt-200 rounded-[1.5rem] border-solid bg-bone-50 h-[52rem] shadow-md relative z-20 overflow-visible"
    data-testid="roast-receipt-printer"
    aria-live="polite"
    aria-label="Roast receipt printer"
  >
    <div class="rounded-[1.5rem] bg-bone-50 h-full relative overflow-visible">
      <div
        data-testid="roast-printer-stage"
        class="mx-auto mt-8 max-w-[18.75rem] h-[47rem] w-[calc(100%-2rem)] relative"
      >
        <div class="rounded-[0.9375rem] bg-basalt-700 h-[6.25rem] w-full shadow-lg inset-x-0 top-0 absolute z-0" />

        <div class="rounded-[0.75rem] bg-basalt-800 h-20 w-full shadow-inner inset-x-0 top-0 absolute z-20">
          <div class="text-[0.625rem] text-bone-100/70 tracking-[0.08em] font-meta uppercase bottom-2 left-3 absolute">
            GRILLME
          </div>
          <span class="rounded-full bg-primary h-1.5 w-1.5 bottom-2 right-3 absolute" aria-hidden="true" />
        </div>

        <div
          data-testid="roast-printer-slot"
          class="border-t-[5px] border-basalt-950 rounded-t-[0.25rem] border-solid inset-x-5 bottom-0 top-[5.3125rem] absolute z-30 overflow-hidden"
          aria-hidden="true"
        >
          <div
            class="mx-auto max-w-[34rem] w-[calc(100%-0.4375rem)] origin-top transition-transform duration-[850ms] ease-out inset-x-0 top-0 absolute z-10 motion-reduce:transition-none"
            :style="{ transform: paperTranslate }"
          >
            <div class="bg-bone-100 h-[40rem] w-full shadow-lg relative">
              <div
                data-testid="roast-receipt-paper"
                class="text-basalt-950 px-6 pb-8 pt-14 h-full w-full relative z-10"
                :style="{ clipPath: tornEdgeClipPath }"
              >
                <div class="flex items-start justify-between">
                  <div class="flex gap-2 items-center">
                    <span class="rounded-full bg-primary h-2 w-2" />
                    <span class="text-[11px] tracking-[0.12em] font-meta uppercase">GRILLME</span>
                  </div>
                  <span class="text-[8px] tracking-[0.16em] font-meta opacity-60 uppercase">
                    {{ isFiled ? 'Filed' : 'Printing' }}
                  </span>
                </div>

                <div class="mt-4 text-center">
                  <p class="text-[10px] tracking-[0.14em] font-meta uppercase">
                    Roast receipt
                  </p>
                  <p class="text-[8px] tracking-[0.14em] font-meta mt-1 opacity-60 uppercase">
                    Evidence / verdict
                  </p>
                  <p class="text-[8px] tracking-[0.14em] font-meta mt-3 opacity-60 uppercase">
                    @{{ fixture.username }} · #{{ receiptId }}
                  </p>
                </div>

                <div class="my-4 border-t-[1px] border-basalt-950/35 border-dashed" />

                <div class="text-[8px] font-meta space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="tracking-[0.12em] opacity-60 uppercase">Intensity</span>
                    <span class="tracking-[0.05em] whitespace-nowrap uppercase">{{ isEvidenceVisible ? intensity : '—' }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="tracking-[0.12em] opacity-60 uppercase">Evidence</span>
                    <span class="tracking-[0.05em] whitespace-nowrap uppercase">{{ isEvidenceVisible ? `${commitCount} commits` : '—' }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="tracking-[0.12em] opacity-60 uppercase">Files</span>
                    <span class="tracking-[0.08em] uppercase">{{ isEvidenceVisible ? fileCount : '—' }}</span>
                  </div>
                </div>

                <div class="my-4 border-t-[1px] border-basalt-950/35 border-dashed" />

                <div class="text-[9px] font-meta space-y-2">
                  <div class="tracking-[0.12em] opacity-60 flex uppercase items-center justify-between">
                    <span>Item</span>
                    <span>Amount</span>
                  </div>
                  <div
                    v-for="(item, index) in receiptItems"
                    :key="item.label"
                    class="flex transition-[opacity,transform] duration-500 ease-out items-center justify-between motion-reduce:transition-none"
                    :class="areScoresVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'"
                    :style="{ transitionDelay: `${index * 90}ms` }"
                  >
                    <span class="tracking-[0.08em] uppercase">{{ item.label }}</span>
                    <span class="text-[11px]">{{ areScoresVisible ? `$${item.amount}.00` : '—' }}</span>
                  </div>
                </div>

                <div class="my-4 border-t-[1px] border-basalt-950/35 border-dashed" />

                <div class="text-[9px] font-meta space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="tracking-[0.12em] opacity-60 uppercase">Roast tax</span>
                    <span>{{ areScoresVisible ? '$00.00' : '—' }}</span>
                  </div>
                  <div class="font-semibold flex items-center justify-between">
                    <span class="tracking-[0.12em] uppercase">Total damage</span>
                    <span class="text-[11px]">{{ areScoresVisible ? `$${receiptTotal}.00` : '—' }}</span>
                  </div>
                </div>

                <div class="my-4 border-t-[1px] border-basalt-950/35 border-dashed" />

                <div class="text-[9px] font-meta flex items-center justify-between">
                  <span class="tracking-[0.12em] opacity-60 uppercase">Grade</span>
                  <span class="text-[14px] text-primary">{{ isGradeVisible ? fixture.metrics.grade : '—' }}</span>
                </div>

                <div class="mt-5 flex justify-center">
                  <div
                    class="text-[14px] text-primary font-meta border-[1px] border-primary rounded-full flex h-14 w-14 transition-[opacity,transform] duration-500 ease-out items-center justify-center motion-reduce:transition-none"
                    :class="isGradeVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'"
                  >
                    {{ isGradeVisible ? fixture.metrics.grade : '—' }}
                  </div>
                </div>

                <div class="mt-5 opacity-60 flex gap-[2px] h-7 items-end inset-x-6 bottom-12 justify-center absolute">
                  <span v-for="(width, index) in barcodeWidths" :key="index" class="bg-basalt-950 h-full" :style="{ width: `${width}px` }" />
                </div>

                <div class="text-[8px] tracking-[0.16em] font-meta text-center opacity-55 uppercase inset-x-6 bottom-5 absolute">
                  Welcome to GrillMe · filed / no refunds
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
