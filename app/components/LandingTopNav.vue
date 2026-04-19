<template>
  <header class="pt-4 bg-transparent w-full top-0 fixed z-50">
    <div class="px-4 lg:px-0 md:px-12">
      <nav class="bg-muted/10 supports-backdrop-filter:backdrop-blur-md mx-auto py-2 pl-2 pr-2 border border-white/28 rounded-[22px] max-w-5xl w-full hidden ring-1 ring-white/14 shadow-[0_8px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.1)] items-center justify-between z-50 backdrop-blur-md lg:py-1.5 lg:pl-2.5 lg:pr-2.5 lg:flex">
        <NuxtLink class="pl-1.5 inline-flex gap-2.5 items-center" to="/">
          <svg class="text-primary size-9" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <path d="M20 3v9M20 28v9M3 20h9M28 20h9M8.5 8.5l6.4 6.4M25.1 25.1l6.4 6.4M31.5 8.5l-6.4 6.4M14.9 25.1l-6.4 6.4" stroke="currentColor" stroke-linecap="round" stroke-width="3.2" />
          </svg>
          <span class="text-2xl/none text-on-surface tracking-[-0.025em] font-bold font-headline">
            Grillme
          </span>
        </NuxtLink>

        <div class="inline-flex items-center">
          <NuxtLink class="text-lg/none text-on-surface/92 font-body font-medium px-4 py-2 rounded-lg transition-colors duration-150 hover:text-on-surface hover:bg-white/6" to="/#wall-of-shame">
            Wall of Shame
          </NuxtLink>
          <NuxtLink class="text-lg/none text-on-surface/92 font-body font-medium px-4 py-2 rounded-lg transition-colors duration-150 hover:text-on-surface hover:bg-white/6" to="/#metrics">
            Metrics
          </NuxtLink>
          <NuxtLink class="text-lg/none text-on-surface/92 font-body font-medium px-4 py-2 rounded-lg transition-colors duration-150 hover:text-on-surface hover:bg-white/6" to="/docs#api">
            API
          </NuxtLink>
        </div>

        <button class="text-lg/none text-on-surface font-body font-medium px-6 py-2.5 rounded-full bg-primary transition-transform duration-150 active:scale-95 hover:scale-105">
          Connect GitHub
        </button>
      </nav>

      <nav class="px-4 py-3 border rounded-xl bg-background/70 flex w-full shadow-[0_8px_32px_rgba(255,51,0,0.05)] items-center justify-between backdrop-blur-xl lg:hidden">
        <NuxtLink class="text-xl text-primary tracking-tight font-black font-headline uppercase italic" to="/">
          grillme.dev
        </NuxtLink>
        <button class="text-xs text-on-surface tracking-[0.14em] font-bold font-display px-4 py-2 rounded-sm uppercase transition-transform duration-150 from-primary to-primary-container bg-gradient-to-r active:scale-95 hover:scale-105">
          Connect GitHub
        </button>
      </nav>
    </div>
  </header>
</template>
