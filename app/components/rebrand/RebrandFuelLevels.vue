<script setup lang="ts">
import type { RoastIntensityValue } from '~/constants/roastIntensity'
import RebrandChapterMeta from '~/components/rebrand/RebrandChapterMeta.vue'

const selectedIntensity = defineModel<RoastIntensityValue>({ required: true })

const levels = [
  {
    value: 1 as const,
    label: 'Rare',
    heat: 'Lightly seared',
    summary: 'Dry feedback with the safety still on.',
    included: ['4 selected commits', '10 prompt-relevant files', 'Restrained punchlines'],
  },
  {
    value: 2 as const,
    label: 'Medium Rare',
    heat: 'Balanced heat',
    summary: 'Sharp enough to share. Useful enough to keep.',
    included: ['6 selected commits', '14 prompt-relevant files', 'Evidence-backed verdict'],
  },
  {
    value: 4 as const,
    label: 'Burned to Crisp',
    heat: 'Maximum char',
    summary: 'The broadest evidence window and no emotional warranty.',
    included: ['12 selected commits', '26 prompt-relevant files', 'Maximum safe variation'],
  },
] as const
</script>

<template>
  <section class="mx-auto px-4 pb-36 pt-8 max-w-[96rem] min-h-[112svh] lg:px-10 sm:px-6 lg:pb-44">
    <RebrandChapterMeta index="04" title="Roast levels" />

    <div class="pt-24 gap-4 grid lg:grid-cols-3">
      <button
        v-for="(level, index) in levels"
        :key="level.label"
        type="button"
        class="p-7 text-left border-[1px] border-basalt-950/16 border-solid flex flex-col min-h-[34rem] transition-[transform,background-color,color] duration-300 justify-between sm:p-9"
        :class="[
          selectedIntensity === level.value ? 'bg-basalt-950 text-explore-copy' : 'bg-basalt-50 text-basalt-950 hover:bg-bone-100',
          index === 1 ? 'lg:translate-y-12' : index === 2 ? 'lg:translate-y-24' : '',
        ]"
        @click="selectedIntensity = level.value"
      >
        <div>
          <p class="text-2xl tracking-[-0.035em] font-display">
            {{ level.label }}
          </p>
          <p class="text-sm leading-relaxed font-body mt-5 max-w-[18rem]" :class="selectedIntensity === level.value ? 'text-explore-muted' : 'text-basalt-500'">
            {{ level.summary }}
          </p>
        </div>
        <div>
          <p class="text-[clamp(3.2rem,5vw,5.5rem)] leading-none tracking-[-0.07em] font-display">
            {{ String(level.value).padStart(2, '0') }}
          </p>
          <p class="text-xs tracking-[0.14em] font-meta mt-2 uppercase" :class="selectedIntensity === level.value ? 'text-signal-red-400' : 'text-signal-red-700'">
            {{ level.heat }}
          </p>
          <div class="mt-12 pt-5 border-t-[1px] border-solid" :class="selectedIntensity === level.value ? 'border-white/18' : 'border-basalt-950/18'">
            <p class="text-base font-display">
              What changes
            </p>
            <ul class="mt-5 space-y-4">
              <li v-for="item in level.included" :key="item" class="text-sm font-body flex gap-3" :class="selectedIntensity === level.value ? 'text-explore-muted' : 'text-basalt-600'">
                <span>+</span>{{ item }}
              </li>
            </ul>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>
