<script setup lang="ts">
import GrillmeLogo from '~/components/GrillmeLogo.vue'

const navigationItems = [
  { label: 'Home', index: '01', href: '#top' },
  { label: 'Evidence', index: '02', href: '#evidence' },
  { label: 'Pipeline', index: '03', href: '#pipeline' },
  { label: 'Receipts', index: '04', href: '#receipts' },
] as const
</script>

<template>
  <header class="pointer-events-none inset-x-0 top-0 absolute z-40">
    <div
      class="px-[clamp(1.5rem,2.4vw,3rem)] pt-[clamp(1.5rem,2.6vw,3rem)] gap-5 grid grid-cols-[auto_1fr_auto] w-full pointer-events-auto items-start"
    >
      <a
        href="#top"
        aria-label="Grillme home"
        class="w-10 block"
      >
        <GrillmeLogo
          accent="#F5F5F5"
          :show-wordmark="false"
        />
      </a>

      <nav
        aria-label="Homepage sections"
        class="gap-8 hidden justify-self-center md:flex lg:gap-11"
      >
        <a
          v-for="item in navigationItems"
          :key="item.href"
          :href="item.href"
          class="group text-sm text-explore-copy/72 font-body pb-1 border-b-[1px] border-transparent border-solid flex gap-1.5 transition-colors items-start hover:text-explore-copy hover:border-white/75"
        >
          <span>{{ item.label }}</span>
          <span class="text-[9px] text-explore-copy/45 font-meta">
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
