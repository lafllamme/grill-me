<script setup lang="ts">
const isMobileMenuOpen = ref(false)

const mobileMenuItems = [
  { label: 'Wall of Shame', to: '/#wall-of-shame' },
  { label: 'Metrics', to: '/#metrics' },
  { label: 'API', to: '/docs#api' },
]

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function onMenuEnter(el: Element) {
  const target = el as HTMLElement
  target.style.height = '0px'
  target.style.opacity = '0'
  target.style.overflow = 'hidden'
  requestAnimationFrame(() => {
    target.style.transition = 'height 300ms ease, opacity 220ms ease'
    target.style.height = `${target.scrollHeight}px`
    target.style.opacity = '1'
  })
}

function onMenuAfterEnter(el: Element) {
  const target = el as HTMLElement
  target.style.height = 'auto'
  target.style.transition = ''
  target.style.overflow = ''
}

function onMenuLeave(el: Element) {
  const target = el as HTMLElement
  target.style.height = `${target.scrollHeight}px`
  target.style.opacity = '1'
  target.style.overflow = 'hidden'
  requestAnimationFrame(() => {
    target.style.transition = 'height 260ms ease, opacity 180ms ease'
    target.style.height = '0px'
    target.style.opacity = '0'
  })
}
</script>

<template>
  <header class="pt-4 bg-transparent h-fit w-full fixed z-[999999] md:top-0">
    <aside class="px-4 lg:px-0 md:px-12">
      <nav class="supports-backdrop-filter:backdrop-blur-md mx-auto py-2 pl-2 pr-2 border border-[rgba(255,255,255,0.10)] rounded-[14px] border-solid bg-[rgba(38,38,38,0.10)] max-w-5xl w-full hidden items-center justify-between z-50 backdrop-blur-md lg:py-1.5 lg:pl-2.5 lg:pr-2.5 lg:flex">
        <NuxtLink to="/">
          <div class="h-9 w-28 relative">
            <GrillmeLogo class="h-full w-full" />
          </div>
        </NuxtLink>

        <div class="inline-flex items-center">
          <NuxtLink class="group/navigation-menu-trigger text-sm text-white leading-6 font-body font-normal px-4 py-2 outline-none rounded-full bg-transparent inline-flex h-9 w-max cursor-pointer transition-all items-center justify-center hover:bg-[rgba(255,86,51,0.16)]" to="/#wall-of-shame">
            Wall of Shame
          </NuxtLink>
          <NuxtLink class="group/navigation-menu-trigger text-sm text-white leading-6 font-body font-normal px-4 py-2 outline-none rounded-full bg-transparent inline-flex h-9 w-max cursor-pointer transition-all items-center justify-center hover:bg-[rgba(255,86,51,0.16)]" to="/#metrics">
            Metrics
          </NuxtLink>
          <NuxtLink class="group/navigation-menu-trigger text-sm text-white leading-6 font-body font-normal px-4 py-2 outline-none rounded-full bg-transparent inline-flex h-9 w-max cursor-pointer transition-all items-center justify-center hover:bg-[rgba(255,86,51,0.16)]" to="/docs#api">
            API
          </NuxtLink>
        </div>

        <aside class="inline-flex gap-2 items-center">
          <button class="group/button text-sm text-white leading-5 font-body font-medium px-4 outline-none border border-transparent rounded-full inline-flex shrink-0 gap-1.5 h-9 cursor-pointer select-none whitespace-nowrap transition-all items-center justify-center bg-clip-padding hover:bg-[rgba(255,86,51,0.16)]">
            Login
          </button>
          <button class="group/button text-sm text-white leading-5 font-body font-medium px-4 outline-none border border-transparent rounded-full bg-[#FF3300] inline-flex shrink-0 gap-1.5 h-9 cursor-pointer select-none whitespace-nowrap transition-all items-center justify-center bg-clip-padding hover:bg-[#E82E00]">
            Connect GitHub
          </button>
        </aside>
      </nav>

      <nav
        class="border border-[rgba(255,255,255,0.10)] rounded-md border-solid bg-[rgba(38,38,38,0.10)] max-h-[calc(100lvh-2rem)] w-full relative overflow-auto backdrop-blur-md md:max-h-[calc(60lvh-2rem)] lg:hidden"
        @wheel.stop
        @touchmove.stop
      >
        <div class="py-2 pl-2.5 pr-2 flex w-full items-center top-0 justify-between sticky z-50">
          <NuxtLink to="/" @click="closeMobileMenu">
            <div class="h-9 w-24 relative">
              <GrillmeLogo class="h-full w-full" />
            </div>
          </NuxtLink>

          <div class="inline-flex gap-2 items-center">
            <button class="group/button text-sm text-white font-body font-normal px-4 outline-none border border-transparent rounded-full bg-[#FF3300] inline-flex shrink-0 gap-1.5 h-9 cursor-pointer select-none whitespace-nowrap transition-all items-center justify-center bg-clip-padding hover:bg-[#E82E00]">
              Connect GitHub
            </button>
            <button
              type="button"
              class="group rounded-lg flex flex-col size-9 cursor-pointer items-center justify-center relative hover:bg-white/5"
              :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
              @click="toggleMobileMenu"
            >
              <span
                class="rounded-full bg-white h-[1.2px] w-[22px] block scale-[0.85] transition-transform duration-200"
                :class="isMobileMenuOpen ? 'translate-y-[4px] rotate-45' : ''"
              />
              <span class="h-[6px] block" />
              <span
                class="rounded-full bg-white h-[1.2px] w-[22px] block scale-[0.85] transition-transform duration-200"
                :class="isMobileMenuOpen ? '-translate-y-[4px] -rotate-45' : ''"
              />
            </button>
          </div>
        </div>

        <Transition
          @enter="onMenuEnter"
          @after-enter="onMenuAfterEnter"
          @leave="onMenuLeave"
        >
          <div
            v-show="isMobileMenuOpen"
            class="px-1 overflow-hidden md:px-4 lg:hidden"
          >
            <div class="pb-4 pt-4 space-y-2.5">
              <NuxtLink
                v-for="(item, index) in mobileMenuItems"
                :key="item.to"
                :to="item.to"
                class="text-base text-white tracking-tight font-medium px-3 py-1 block transition-[opacity,transform] duration-300 ease-out md:px-0"
                :style="{ transitionDelay: `${index * 80}ms` }"
                :class="isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
                @click="closeMobileMenu"
              >
                {{ item.label }}
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </nav>
    </aside>
  </header>
</template>
