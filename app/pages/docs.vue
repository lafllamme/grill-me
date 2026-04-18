<template>
  <section class="mx-auto mt-10 max-w-6xl rounded-3xl border border-orange-500/35 bg-neutral-950/85 p-8 shadow-2xl md:p-10">
    <p class="mb-4 text-xs tracking-[0.2em] text-orange-300 uppercase">
      Docs Hub
    </p>
    <h1 class="mb-3 text-3xl font-black text-orange-100 md:text-4xl">
      Project Documentation
    </h1>
    <p class="max-w-3xl text-sm text-orange-100/80 md:text-base">
      Zentrale Navigation für interne App-Routen und externe Referenzen (Nuxt / UnoCSS).
    </p>

    <div class="mt-6 flex flex-wrap gap-3">
      <NuxtLink
        class="rounded-xl border border-orange-400 bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-orange-400"
        to="/"
      >
        Back Home
      </NuxtLink>
      <NuxtLink
        class="rounded-xl border border-orange-400/40 bg-black px-4 py-2 text-sm font-semibold text-orange-100 transition hover:bg-orange-500/15"
        to="/#manifesto"
      >
        Manifesto
      </NuxtLink>
      <NuxtLink
        class="rounded-xl border border-orange-400/40 bg-black px-4 py-2 text-sm font-semibold text-orange-100 transition hover:bg-orange-500/15"
        to="/#leaderboard"
      >
        Leaderboard
      </NuxtLink>
    </div>

    <div class="mt-8 grid gap-4 md:grid-cols-2">
      <article class="rounded-2xl border border-orange-500/30 bg-neutral-900/80 p-5">
        <p class="mb-2 text-xs tracking-[0.14em] text-orange-300 uppercase">
          Internal
        </p>
        <ul class="space-y-2 text-sm">
          <li>
            <NuxtLink class="text-orange-100 hover:text-orange-200 underline-offset-4 hover:underline" to="/">
              / (Home)
            </NuxtLink>
          </li>
          <li>
            <NuxtLink class="text-orange-100 hover:text-orange-200 underline-offset-4 hover:underline" to="/docs">
              /docs (this page)
            </NuxtLink>
          </li>
        </ul>
      </article>

      <article class="rounded-2xl border border-orange-500/30 bg-neutral-900/80 p-5">
        <p class="mb-2 text-xs tracking-[0.14em] text-orange-300 uppercase">
          References
        </p>
        <ul class="space-y-2 text-sm">
          <li>
            <a class="text-orange-100 hover:text-orange-200 underline-offset-4 hover:underline" href="https://nuxt.com/docs" rel="noreferrer" target="_blank">
              Nuxt Docs
            </a>
          </li>
          <li>
            <a class="text-orange-100 hover:text-orange-200 underline-offset-4 hover:underline" href="https://unocss.dev/" rel="noreferrer" target="_blank">
              UnoCSS Docs
            </a>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>
