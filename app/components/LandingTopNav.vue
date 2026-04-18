<template>
  <header class="fixed top-0 z-50 w-full bg-background/70 shadow-[0_8px_32px_rgba(255,51,0,0.05)] backdrop-blur-xl">
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <NuxtLink class="font-headline text-2xl font-black tracking-tight text-primary italic uppercase" to="/">
        grillme.dev
      </NuxtLink>

      <div class="hidden items-center gap-8 md:flex">
        <NuxtLink class="font-body text-sm text-on-surface-variant transition-colors duration-150 hover:text-on-surface" to="/#wall-of-shame">
          Wall of Shame
        </NuxtLink>
        <NuxtLink class="font-body text-sm text-on-surface-variant transition-colors duration-150 hover:text-on-surface" to="/#metrics">
          Metrics
        </NuxtLink>
        <NuxtLink class="font-body text-sm text-on-surface-variant transition-colors duration-150 hover:text-on-surface" to="/docs#api">
          API
        </NuxtLink>
      </div>

      <button class="rounded-sm bg-gradient-to-r from-primary to-primary-container px-5 py-2 font-display text-xs font-bold tracking-[0.14em] text-on-surface uppercase transition-transform duration-150 hover:scale-105 active:scale-95">
        Connect GitHub
      </button>
    </nav>
  </header>
</template>
