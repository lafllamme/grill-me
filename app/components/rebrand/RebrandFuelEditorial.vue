<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '#components'
import RebrandChapterMeta from '~/components/rebrand/RebrandChapterMeta.vue'
import RebrandScrollHeadline from '~/components/rebrand/RebrandScrollHeadline.vue'

const openFaq = ref<number | null>(0)

const faqs = [
  {
    question: 'Does Grillme read private repositories?',
    answer: 'No. The public username flow uses public GitHub activity and the commit data reachable through that public trail.',
  },
  {
    question: 'Is the reasoning actual hidden model reasoning?',
    answer: 'No. The interface presents verified orchestration stages and evidence references, not private chain-of-thought.',
  },
  {
    question: 'Why stream the result instead of waiting for one response?',
    answer: 'The status, evidence, title, roast points, and fixes arrive at different times. Streaming makes that work visible and reduces perceived latency.',
  },
] as const
</script>

<template>
  <section id="faq" class="mx-auto px-4 pb-40 pt-8 max-w-[96rem] scroll-mt-20 lg:px-10 sm:px-6">
    <RebrandChapterMeta index="09" title="Method / frequently asked questions" />

    <div class="pt-20 gap-16 grid lg:gap-24 lg:grid-cols-[0.72fr_1.28fr]">
      <div class="fuel-view-reveal motion-reduce:[animation:none]">
        <p class="text-[10px] text-signal-red-700 tracking-[0.15em] font-meta uppercase">
          How the receipt is built
        </p>
        <RebrandScrollHeadline
          class="fuel-editorial-headline text-basalt-950 mt-8 max-w-[10ch]"
          text="The fine print, without the fine print."
        />
        <p class="text-base text-basalt-600 leading-relaxed font-body mt-10 max-w-[29rem] sm:text-lg">
          Grillme separates public evidence, orchestration status, and generated commentary so the joke never pretends to be the source.
        </p>
        <div class="mt-12 pt-5 border-t-[1px] border-basalt-950/18 border-solid flex items-center justify-between">
          <span class="text-[10px] text-basalt-500 tracking-[0.13em] font-meta uppercase">Public data only</span>
          <Icon class="text-xl text-signal-red-700" name="ph:shield-check" />
        </div>
      </div>

      <div class="fuel-view-reveal motion-reduce:[animation:none]">
        <article v-for="(faq, index) in faqs" :key="faq.question" class="border-b-[1px] border-basalt-950/18 border-solid first:border-t-[1px]">
          <button type="button" class="py-7 text-left flex gap-6 w-full items-center justify-between" :aria-expanded="openFaq === index" @click="openFaq = openFaq === index ? null : index">
            <span class="text-xl text-basalt-950 tracking-[-0.02em] font-body sm:text-2xl">{{ faq.question }}</span>
            <Icon class="text-2xl text-basalt-950 shrink-0 transition-transform" :class="openFaq === index ? 'rotate-45' : ''" name="ph:plus" />
          </button>
          <div class="grid transition-[grid-template-rows] duration-300" :class="openFaq === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
            <div class="overflow-hidden">
              <p class="text-base text-basalt-600 leading-relaxed font-body pb-7 max-w-[42rem]">
                {{ faq.answer }}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
