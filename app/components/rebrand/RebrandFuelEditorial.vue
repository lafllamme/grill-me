<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '#components'
import RebrandChapterMeta from '~/components/rebrand/RebrandChapterMeta.vue'

const openFaq = ref<number | null>(0)

const articles = [
  { index: '001', title: 'Why the receipt matters', category: 'Evidence', tone: 'bg-signal-red-950' },
  { index: '002', title: 'What the agent is allowed to read', category: 'Privacy', tone: 'bg-basalt-900' },
  { index: '003', title: 'How the stink score is calculated', category: 'Metrics', tone: 'bg-signal-red-800' },
  { index: '004', title: 'Designing a roast worth sharing', category: 'Product', tone: 'bg-basalt-950' },
] as const

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
  <section class="mx-auto px-4 pb-12 pt-8 max-w-[96rem] lg:px-10 sm:px-6">
    <RebrandChapterMeta index="08" title="Evidence notes" />

    <div class="pt-20 gap-4 grid lg:grid-cols-4 sm:grid-cols-2">
      <article v-for="(article, index) in articles" :key="article.index" :class="index % 2 ? 'lg:translate-y-16' : ''">
        <div class="border-[1px] border-basalt-950/16 border-solid h-[22rem] relative overflow-hidden" :class="article.tone">
          <div class="rounded-full bg-signal-red-500/24 h-56 w-56 absolute blur-[48px] -right-20 -top-20" />
          <div class="p-6 flex flex-col inset-0 justify-between absolute">
            <Icon class="text-3xl text-signal-red-400" :name="index % 2 ? 'ph:git-commit' : 'ph:code'" />
            <p class="text-[10px] text-explore-muted tracking-[0.14em] font-meta uppercase">
              {{ article.category }}
            </p>
          </div>
        </div>
        <div class="py-4 gap-4 grid grid-cols-[auto_1fr_auto]">
          <span class="text-xs text-basalt-700 font-mono">{{ article.index }}</span>
          <h3 class="text-base text-basalt-950 leading-tight font-display">
            {{ article.title }}
          </h3>
          <span class="text-xs text-basalt-700 font-meta">©26</span>
        </div>
      </article>
    </div>

    <div class="pb-20 pt-40">
      <RebrandChapterMeta index="09" title="Frequently asked questions" />
      <div class="pt-16 gap-12 grid lg:grid-cols-[0.7fr_1.3fr]">
        <div class="border-[1px] border-basalt-950/16 border-solid bg-signal-red-50 min-h-[24rem] relative overflow-hidden">
          <div class="rounded-full bg-signal-red-500/28 h-72 w-72 bottom-[-8rem] absolute blur-[55px] -left-20" />
          <div class="p-7 flex flex-col inset-0 justify-between absolute">
            <Icon class="text-4xl text-signal-red-700" name="ph:question" />
            <p class="text-3xl text-basalt-950 leading-[0.95] tracking-[-0.045em] font-display max-w-[10ch]">
              The fine print, without the fine print.
            </p>
          </div>
        </div>

        <div>
          <article v-for="(faq, index) in faqs" :key="faq.question" class="border-b-[1px] border-basalt-950/18 border-solid">
            <button type="button" class="py-7 text-left flex gap-6 w-full items-center justify-between" :aria-expanded="openFaq === index" @click="openFaq = openFaq === index ? null : index">
              <span class="text-xl text-basalt-950 tracking-[-0.025em] font-display sm:text-2xl">{{ faq.question }}</span>
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
    </div>

    <footer class="py-8 border-t-[1px] border-basalt-950/18 border-solid flex gap-5 items-center justify-between">
      <p class="text-[10px] text-basalt-600 tracking-[0.14em] font-meta uppercase">
        Grillme / evidence-backed code roasts
      </p>
      <a href="#target" class="text-[10px] text-signal-red-700 tracking-[0.14em] font-meta uppercase">Back to the grill ↑</a>
    </footer>
  </section>
</template>
