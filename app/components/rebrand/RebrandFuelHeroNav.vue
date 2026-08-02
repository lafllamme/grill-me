<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { motion } from 'motion-v'
import { computed, ref } from 'vue'

import GrillmeLogo from '~/components/GrillmeLogo.vue'

const route = useRoute()
const logoFontVariant = computed(() => {
  const raw = route.query.font
  return typeof raw === 'string' ? raw : 'jakarta'
})

const navigationItems = [
  { label: 'Home', index: '01', href: '#top' },
  { label: 'Evidence', index: '02', href: '#evidence' },
  { label: 'Pipeline', index: '03', href: '#pipeline' },
  { label: 'Receipts', index: '04', href: '#receipts' },
] as const

const hoveredNavigationIndex = ref<number | null>(null)
const reducedMotion = usePreferredReducedMotion()
const heroEntryInitial = computed(() => reducedMotion.value === 'reduce' ? false : 'hidden')

const heroHeaderVariants = {
  hidden: { opacity: 0, y: -100 },
  visible: { opacity: 1, y: 0 },
}
const navigationItemVariants = {
  hidden: { opacity: 0, y: -14 },
  visible: { opacity: 1, y: 0 },
}
const heroHeaderTransition = { duration: 1.35, ease: [0.22, 1, 0.36, 1] as const, delay: 0.15 }
function createNavigationItemTransition(index: number) {
  return {
    duration: 0.72,
    ease: [0.22, 1, 0.36, 1] as const,
    delay: 0.18 + index * 0.18,
  }
}
</script>

<template>
  <header class="pointer-events-none inset-x-0 top-0 absolute z-40">
    <motion.div
      class="px-[clamp(1.5rem,1.5vw,2rem)] mt-6 flex h-[4.375rem] w-full pointer-events-auto items-center justify-between relative"
      :initial="heroEntryInitial"
      animate="visible"
      :variants="heroHeaderVariants"
      :transition="heroHeaderTransition"
    >
      <div class="h-[20px]">
        <a href="#top" aria-label="Grillme home" class="h-[20px] block">
          <GrillmeLogo
            accent="#F5F5F5"
            shape="85"
            :font="logoFontVariant"
            wordmark="GRILL"
            class="h-full w-auto"
          />
        </a>
      </div>

      <div class="flex ml-[13px] items-center inset-y-0 left-1/2 absolute -translate-x-1/2">
        <nav
          aria-label="Homepage sections"
          class="gap-20 hidden items-center md:flex lg:gap-[5.5rem]"
          @mouseleave="hoveredNavigationIndex = null"
        >
          <motion.a
            v-for="(item, navigationIndex) in navigationItems"
            :key="item.href"
            :href="item.href"
            class="group text-sm text-explore-copy font-body pr-3.5 relative"
            :initial="heroEntryInitial"
            animate="visible"
            :variants="navigationItemVariants"
            :transition="createNavigationItemTransition(navigationIndex)"
            @mouseenter="hoveredNavigationIndex = navigationIndex"
            @focus="hoveredNavigationIndex = navigationIndex"
            @blur="hoveredNavigationIndex = null"
          >
            <span
              class="inline-block transition-opacity duration-300 ease-out relative"
              :class="hoveredNavigationIndex !== null && hoveredNavigationIndex !== navigationIndex
                ? 'opacity-50'
                : 'opacity-100'"
            >
              {{ item.label }}
              <span
                aria-hidden="true"
                class="bg-explore-copy h-px w-0 transition-[width] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] bottom-[-0.15rem] left-0 absolute group-focus-visible:w-full group-hover:w-full"
              />
            </span>
            <span class="text-[9px] text-explore-copy/50 leading-[1] font-meta top-0 absolute -right-2.5">
              {{ item.index }}
            </span>
          </motion.a>
        </nav>
      </div>

      <a
        href="#target"
        class="text-explore-ink p-1.5 border-[1px] border-white/60 rounded-[3px] border-solid bg-explore-copy gap-2 grid grid-cols-[3.5rem_1fr] min-h-[4.375rem] min-w-[16.9375rem] transition-colors hover:bg-white"
      >
        <span class="rounded-[2px] bg-signal-red-600 grid min-h-[3.5rem] place-items-center">
          <span class="border-[1px] border-explore-copy rounded-full border-solid h-2.5 w-2.5" />
        </span>
        <span class="py-0.5 grid content-center">
          <span class="text-xs font-display font-semibold sm:text-sm">
            Start the roast
          </span>
          <span class="text-[8px] tracking-[0.08em] font-meta uppercase sm:text-[9px]">
            Public GitHub · Grill now ↘
          </span>
        </span>
      </a>
    </motion.div>
  </header>
</template>
