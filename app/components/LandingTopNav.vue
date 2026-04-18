<template>
  <header class="sticky top-0 z-30 border-b border-orange-500/15 bg-black/90 backdrop-blur">
    <nav class="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 md:px-8">
      <NuxtLink class="group flex items-center gap-3" to="/">
        <span class="flex h-8 w-8 items-center justify-center border border-orange-500/35 bg-black text-orange-400">
          <NuxtIcon class="text-[18px]" name="ph:fire" />
        </span>
        <span class="font-sans text-lg font-black tracking-tight text-orange-500 uppercase group-hover:text-orange-400">
          Grillme.dev
        </span>
      </NuxtLink>

      <div class="hidden items-center gap-8 md:flex">
        <NuxtLink class="font-sans text-xs tracking-[0.12em] text-zinc-500 uppercase transition hover:bg-orange-500/10 hover:text-zinc-100" to="/#manifesto">
          Manifesto
        </NuxtLink>
        <NuxtLink class="font-sans text-xs tracking-[0.12em] text-zinc-500 uppercase transition hover:bg-orange-500/10 hover:text-zinc-100" to="/#leaderboard">
          Leaderboard
        </NuxtLink>
        <NuxtLink class="font-sans text-xs tracking-[0.12em] text-zinc-500 uppercase transition hover:bg-orange-500/10 hover:text-zinc-100" to="/docs">
          Docs
        </NuxtLink>
      </div>

      <button class="border border-orange-500/35 bg-black px-5 py-2 font-sans text-[11px] font-bold tracking-[0.18em] text-orange-500 uppercase transition hover:bg-orange-500 hover:text-black">
        Login
      </button>
    </nav>
  </header>
</template>
