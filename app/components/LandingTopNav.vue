<template>
  <header class="pt-4 bg-transparent h-fit w-full fixed z-[999999] md:top-0">
    <aside class="px-4 lg:px-0 md:px-12">
      <nav class="supports-backdrop-filter:backdrop-blur-md mx-auto py-2 pl-2 pr-2 border border-[rgba(255,255,255,0.10)] rounded-xl border-solid bg-[rgba(38,38,38,0.10)] max-w-5xl w-full hidden items-center justify-between z-50 backdrop-blur-md lg:py-1.5 lg:pl-2.5 lg:pr-2.5 lg:flex">
        <NuxtLink to="/">
          <div class="h-9 w-30 relative">
            <GrillmeLogo class="h-full w-full" />
          </div>
        </NuxtLink>

        <div class="inline-flex items-center">
          <NuxtLink class="group/navigation-menu-trigger text-sm text-white leading-5 font-body font-normal px-4 py-2 outline-none rounded-full bg-transparent inline-flex h-9 w-max cursor-pointer transition-all items-center justify-center hover:bg-[rgba(255,86,51,0.16)]" to="/#wall-of-shame">
            Wall of Shame
          </NuxtLink>
          <NuxtLink class="group/navigation-menu-trigger text-sm text-white leading-5 font-body font-normal px-4 py-2 outline-none rounded-full bg-transparent inline-flex h-9 w-max cursor-pointer transition-all items-center justify-center hover:bg-[rgba(255,86,51,0.16)]" to="/#metrics">
            Metrics
          </NuxtLink>
          <NuxtLink class="group/navigation-menu-trigger text-sm text-white leading-5 font-body font-normal px-4 py-2 outline-none rounded-full bg-transparent inline-flex h-9 w-max cursor-pointer transition-all items-center justify-center hover:bg-[rgba(255,86,51,0.16)]" to="/docs#api">
            API
          </NuxtLink>
        </div>

        <aside class="inline-flex gap-2 items-center">
          <button class="group/button text-sm text-white leading-5 font-body font-normal px-4 outline-none border border-transparent rounded-full inline-flex shrink-0 gap-1.5 h-9 cursor-pointer select-none whitespace-nowrap transition-all items-center justify-center bg-clip-padding hover:bg-[rgba(255,86,51,0.16)]">
            Login
          </button>
          <button class="group/button text-sm text-white leading-5 font-body font-normal px-4 outline-none border border-transparent rounded-full bg-[#FF3300] inline-flex shrink-0 gap-1.5 h-9 cursor-pointer select-none whitespace-nowrap transition-all items-center justify-center bg-clip-padding hover:bg-[#E82E00]">
            Connect GitHub
          </button>
        </aside>
      </nav>

      <nav class="border border-[rgba(255,255,255,0.10)] rounded-md bg-[rgba(38,38,38,0.10)] max-h-[calc(100lvh-2rem)] w-full relative overflow-auto backdrop-blur-md md:max-h-[calc(60lvh-2rem)] lg:hidden">
        <div class="py-2 pl-2.5 pr-2 flex w-full items-center top-0 justify-between sticky z-50">
          <NuxtLink to="/">
            <div class="h-9 w-26 relative">
              <GrillmeLogo class="h-full w-full" />
            </div>
          </NuxtLink>

          <div class="inline-flex gap-2 items-center">
            <button class="group/button text-sm text-white font-body font-normal px-4 outline-none border border-transparent rounded-full bg-[#FF3300] inline-flex shrink-0 gap-1.5 h-9 cursor-pointer select-none whitespace-nowrap transition-all items-center justify-center bg-clip-padding hover:bg-[#E82E00]">
              Connect GitHub
            </button>
          </div>
        </div>
      </nav>
    </aside>
  </header>
</template>
