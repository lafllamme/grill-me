<script setup lang="ts">
import RebrandScrollHeadline from '~/components/rebrand/RebrandScrollHeadline.vue'

const footerLinks = [
  { index: '01', label: 'Target', href: '#target' },
  { index: '02', label: 'Pipeline', href: '#pipeline' },
  { index: '03', label: 'Receipts', href: '#receipts' },
  { index: '04', label: 'FAQ', href: '#faq' },
] as const
</script>

<template>
  <footer id="site-footer" class="mx-auto px-4 pb-6 pt-12 flex flex-col max-w-[96rem] min-h-[46rem] lg:px-10 sm:px-6">
    <div class="border-t-[1px] border-white/18 border-solid flex-1">
      <div class="pt-20 gap-20 grid lg:pt-24 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <RebrandScrollHeadline
            as="p"
            class="fuel-editorial-headline text-explore-muted"
            text="Your next commit"
          />
          <RebrandScrollHeadline
            as="p"
            class="fuel-editorial-headline text-explore-copy"
            text="is already evidence."
            :delay="0.11"
          />
          <a href="#target" class="text-lg text-explore-copy font-body mt-16 pb-3 border-b-[1px] border-white/60 border-solid flex max-w-[21rem] items-center justify-between sm:text-xl">
            Start another roast
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <nav aria-label="Footer navigation" class="lg:pt-3">
          <a
            v-for="link in footerLinks"
            :key="link.href"
            :href="link.href"
            class="py-4 border-b-[1px] border-white/18 border-solid flex items-center justify-between first:border-t-[1px]"
          >
            <span class="text-base text-explore-copy font-body">{{ link.label }}</span>
            <span class="text-[10px] text-explore-muted font-mono">{{ link.index }}</span>
          </a>
        </nav>
      </div>

      <div class="mt-20 pt-6 border-t-[1px] border-white/18 border-solid lg:mt-28">
        <div class="flex items-end justify-between">
          <p class="text-[clamp(4.5rem,16.5vw,15rem)] text-explore-copy leading-[0.68] tracking-[-0.095em] font-display font-semibold select-none">
            GRILLME
          </p>
          <p class="text-xs text-explore-copy font-mono pb-1 shrink-0 sm:pb-3">
            © 2026
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
