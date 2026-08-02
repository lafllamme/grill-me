<script setup lang="ts">
import { computed, ref } from 'vue'

import GrillmeLogo from '~/components/GrillmeLogo.vue'

const route = useRoute()
const logoShapeVariant = computed(() => {
  const raw = route.query.logo
  return typeof raw === 'string' ? raw : '85'
})
const logoFontVariant = computed(() => {
  const raw = route.query.font
  return typeof raw === 'string' ? raw : undefined
})

const navigationItems = [
  { label: 'Home', index: '01', href: '#top' },
  { label: 'Evidence', index: '02', href: '#evidence' },
  { label: 'Pipeline', index: '03', href: '#pipeline' },
  { label: 'Receipts', index: '04', href: '#receipts' },
] as const

const hoveredNavigationIndex = ref<number | null>(null)
</script>

<template>
  <header class="pointer-events-none inset-x-0 top-0 absolute z-40">
    <div
      class="px-[clamp(1.5rem,1.5vw,2rem)] py-[max(0.875rem,calc(3.9vw-1.7rem))] flex w-full pointer-events-auto items-center justify-between relative"
    >
      <a
        href="#top"
        aria-label="Grillme home"
        class="h-[18px] block translate-y-[9px]"
      >
        <GrillmeLogo
          accent="#F5F5F5"
          :shape="logoShapeVariant"
          :font="logoFontVariant"
          wordmark="GRILL"
          class="h-full w-auto"
        />
      </a>

      <nav
        aria-label="Homepage sections"
        class="gap-20 hidden items-center inset-y-0 left-1/2 absolute md:flex lg:gap-[6.5rem] -translate-x-1/2 translate-y-[12px]"
        @mouseleave="hoveredNavigationIndex = null"
      >
        <a
          v-for="(item, navigationIndex) in navigationItems"
          :key="item.href"
          :href="item.href"
          class="group text-sm text-explore-copy font-body transition-opacity duration-300 ease-out relative"
          :class="hoveredNavigationIndex !== null && hoveredNavigationIndex !== navigationIndex
            ? 'opacity-30'
            : 'opacity-100'"
          @mouseenter="hoveredNavigationIndex = navigationIndex"
          @focus="hoveredNavigationIndex = navigationIndex"
          @blur="hoveredNavigationIndex = null"
        >
          <span class="pb-1 inline-block relative">
            {{ item.label }}
            <span
              aria-hidden="true"
              class="bg-explore-copy h-px origin-left scale-x-0 transition-transform duration-300 ease-out inset-x-0 bottom-0 absolute group-focus-visible:scale-x-100 group-hover:scale-x-100"
            />
          </span>
          <span class="text-[9px] text-explore-copy/50 font-meta absolute -right-3 -top-1">
            {{ item.index }}
          </span>
        </a>
      </nav>

      <a
        href="#target"
        class="text-explore-ink p-1 border-[1px] border-white/60 rounded-[3px] border-solid bg-explore-copy gap-2 grid grid-cols-[2.75rem_1fr] min-w-[9rem] transition-colors hover:bg-white sm:min-w-[13rem]"
      >
        <span class="rounded-[2px] bg-signal-red-600 grid min-h-[2.75rem] place-items-center">
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
    </div>
  </header>
</template>
