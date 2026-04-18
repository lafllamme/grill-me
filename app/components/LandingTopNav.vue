<template>
  <header class="bg-background/70 w-full shadow-[0_8px_32px_rgba(255,51,0,0.05)] top-0 fixed z-50 backdrop-blur-xl">
    <nav class="mx-auto px-6 py-4 flex max-w-7xl items-center justify-between">
      <NuxtLink class="text-2xl text-primary tracking-tight font-black font-headline uppercase italic" to="/">
        grillme.dev
      </NuxtLink>

      <div class="gap-8 hidden items-center md:flex">
        <NuxtLink class="text-sm text-on-surface-variant font-body transition-colors duration-150 hover:text-on-surface" to="/#wall-of-shame">
          Wall of Shame
        </NuxtLink>
        <NuxtLink class="text-sm text-on-surface-variant font-body transition-colors duration-150 hover:text-on-surface" to="/#metrics">
          Metrics
        </NuxtLink>
        <NuxtLink class="text-sm text-on-surface-variant font-body transition-colors duration-150 hover:text-on-surface" to="/docs#api">
          API
        </NuxtLink>
      </div>

      <button class="text-xs text-on-surface tracking-[0.14em] font-bold font-display px-5 py-2 rounded-sm uppercase transition-transform duration-150 from-primary to-primary-container bg-gradient-to-r active:scale-95 hover:scale-105">
        Connect GitHub
      </button>
    </nav>
  </header>
</template>
