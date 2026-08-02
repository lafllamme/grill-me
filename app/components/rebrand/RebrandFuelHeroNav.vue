<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { motion } from 'motion-v'
import { computed, ref } from 'vue'

import GrillmeLogo from '~/components/GrillmeLogo.vue'

const props = withDefaults(defineProps<{
  isRevealed?: boolean
}>(), {
  isRevealed: false,
})

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
const heroAnimationState = computed(() => props.isRevealed || reducedMotion.value === 'reduce' ? 'visible' : 'hidden')

const heroHeaderVariants = {
  hidden: { opacity: 0, y: -28 },
  visible: { opacity: 1, y: 0 },
}
const navigationItemVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0 },
}
const heroHeaderTransition = { duration: 0.95, ease: [0.22, 1, 0.36, 1] as const, delay: 0.02 }
function createNavigationItemTransition(index: number) {
  return {
    duration: 0.78,
    ease: [0.22, 1, 0.36, 1] as const,
    delay: 0.16 + index * 0.2,
  }
}
</script>

<template>
  <header class="pointer-events-none inset-x-0 top-0 absolute z-40">
    <motion.div
      class="px-[clamp(1.5rem,1.5vw,2rem)] mt-6 flex h-[4.375rem] w-full pointer-events-auto items-center justify-between relative"
      :initial="heroEntryInitial"
      :animate="heroAnimationState"
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
            :animate="heroAnimationState"
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
        class="group text-explore-ink py-[2px] pl-[2px] pr-2 border-[1px] border-white/60 rounded-[5px] border-solid bg-explore-copy gap-2.5 grid grid-cols-[4rem_1fr] h-[4.375rem] min-w-[16.9375rem] transition-colors relative hover:bg-white"
      >
        <span class="rounded-[2.5px] bg-signal-red-600 grid self-center size-16 overflow-hidden place-items-center">
          <img
            src="https://thumbs.dreamstime.com/b/crosshair-symbol-isoliert-auf-schwarzem-hintergrund-einfaches-logo-161246758.jpg"
            alt=""
            class="size-full transition-transform duration-500 ease-out object-cover group-hover:scale-110"
          >
        </span>
        <span class="py-0.5 pr-6 flex flex-col justify-between">
          <span class="text-[1.2rem] leading-[0.95] tracking-[-0.035em] font-body font-medium">
            Face the heat
          </span>
          <span class="flex flex-col">
            <span class="text-[9px] leading-[1.1] tracking-[0.08em] font-meta uppercase">
              Public GitHub
            </span>
            <span class="text-[9px] text-explore-ink/50 leading-[1.1] tracking-[0.08em] font-meta uppercase">
              No Mercy
            </span>
          </span>
        </span>
        <span aria-hidden="true" class="text-lg leading-none transition-transform duration-300 ease-out right-2 top-2 absolute group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
      </a>
    </motion.div>
  </header>
</template>
