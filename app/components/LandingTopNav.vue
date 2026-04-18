<template>
  <header class="sticky top-0 z-30 border-b border-outline-variant/35 bg-background/90 backdrop-blur-[20px]">
    <nav class="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 md:px-8">
      <NuxtLink class="group flex items-center gap-3" to="/">
        <span class="flex h-8 w-8 items-center justify-center border border-primary-container/40 bg-surface-container-lowest text-primary">
          <NuxtIcon class="text-[18px]" name="ph:fire" />
        </span>
        <span class="font-display text-lg font-black tracking-tight text-primary-container uppercase group-hover:text-primary">
          Grillme.dev
        </span>
      </NuxtLink>

      <div class="hidden items-center gap-8 md:flex">
        <NuxtLink class="font-display text-xs tracking-[0.12em] text-on-surface-variant uppercase transition hover:bg-primary/10 hover:text-on-surface" to="/#manifesto">
          Manifesto
        </NuxtLink>
        <NuxtLink class="font-display text-xs tracking-[0.12em] text-on-surface-variant uppercase transition hover:bg-primary/10 hover:text-on-surface" to="/#leaderboard">
          Leaderboard
        </NuxtLink>
        <NuxtLink class="font-display text-xs tracking-[0.12em] text-on-surface-variant uppercase transition hover:bg-primary/10 hover:text-on-surface" to="/docs">
          Docs
        </NuxtLink>
      </div>

      <button class="border border-outline/20 bg-background px-5 py-2 font-display text-[11px] font-bold tracking-[0.18em] text-primary-container uppercase transition hover:bg-secondary-container hover:text-on-secondary-container">
        Login
      </button>
    </nav>
  </header>
</template>
