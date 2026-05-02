<script setup lang="ts">
import { motion } from 'motion-v'

interface FooterLink {
  text: string
  url: string
}

interface FooterSection {
  heading: string
  links: FooterLink[]
}

const footerSections: FooterSection[] = [
  {
    heading: 'Product',
    links: [
      { text: 'Roast Terminal', url: '#' },
      { text: 'Leaderboard', url: '#' },
      { text: 'Wall of Shame', url: '#' },
      { text: 'Live Metrics', url: '#' },
    ],
  },
  {
    heading: 'Developers',
    links: [
      { text: 'API Docs', url: '#' },
      { text: 'Usage Guide', url: '#' },
      { text: 'Changelog', url: '#' },
      { text: 'Status', url: '#' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { text: 'Discord', url: '#' },
      { text: 'GitHub', url: '#' },
      { text: 'X / Twitter', url: '#' },
      { text: 'Share Roast', url: '#' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { text: 'Privacy', url: '#' },
      { text: 'Terms', url: '#' },
      { text: 'Security', url: '#' },
      { text: 'Cookies', url: '#' },
    ],
  },
]

const footerContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
}

const footerItemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
}
</script>

<template>
  <footer class="px-4 pb-4 pt-5 bg-black lg:px-10 sm:px-7 sm:pt-8">
    <div class="mx-auto p-3 border border-divider rounded-[32px] max-w-[1320px] sm:p-4">
      <div class="px-6 pb-6 pt-16 border border-divider rounded-[26px] bg-black lg:px-16 md:px-12 sm:px-8 md:pt-20">
        <motion.div
          :variants="footerContainerVariants"
          initial="hidden"
          while-in-view="visible"
          :in-view-options="{ once: true, amount: 0.18 }"
          class="mx-auto flex flex-col gap-12 max-w-7xl md:flex-row md:items-start md:justify-between"
        >
          <motion.div :variants="footerItemVariants" class="max-w-[280px] w-full">
            <p class="text-xl text-on-surface leading-none tracking-tight font-display font-semibold uppercase sm:text-2xl">
              Grill Me
            </p>
            <p class="text-sm text-on-surface-variant tracking-[0.02em] font-body mt-7 sm:text-base">
              © 2026 Grill Me
            </p>
            <p class="text-sm text-on-surface-variant tracking-[0.02em] font-body mt-3 sm:text-base">
              Incinerating code, one PR at a time.
            </p>
          </motion.div>

          <div class="gap-x-8 gap-y-10 grid grid-cols-2 max-w-[720px] w-full sm:gap-x-10 sm:grid-cols-4">
            <motion.div
              v-for="section in footerSections"
              :key="section.heading"
              :variants="footerItemVariants"
              class="min-w-0"
            >
              <p class="text-base text-on-surface tracking-tight font-display font-semibold sm:text-lg">
                {{ section.heading }}
              </p>
              <ul class="mt-5 space-y-4">
                <li v-for="link in section.links" :key="link.text">
                  <a
                    :href="link.url"
                    class="text-sm text-on-surface-variant font-body transition-colors duration-200 sm:text-base hover:text-on-surface"
                  >
                    {{ link.text }}
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.div>

        <motion.p
          class="text-[clamp(3.8rem,16vw,13.8rem)] leading-none font-bold font-display mt-20 text-center select-none uppercase relative"
          :initial="{ opacity: 0, y: 30 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }"
          :in-view-options="{ once: true, amount: 0.35 }"
        >
          <span
            aria-hidden="true"
            class="text-transparent [-webkit-text-stroke:3px_#d4d4d4] inset-0 absolute"
          >
            Grill Me
          </span>
          <span class="text-black relative">Grill Me</span>
        </motion.p>
      </div>
    </div>
  </footer>
</template>
